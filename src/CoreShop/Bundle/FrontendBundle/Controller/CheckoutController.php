<?php

declare(strict_types=1);

/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

namespace CoreShop\Bundle\FrontendBundle\Controller;

use CoreShop\Bundle\WorkflowBundle\Manager\StateMachineManagerInterface;
use CoreShop\Component\Core\Model\OrderInterface;
use CoreShop\Component\Order\Checkout\CheckoutException;
use CoreShop\Component\Order\Checkout\CheckoutManagerFactoryInterface;
use CoreShop\Component\Order\Checkout\CheckoutStepInterface;
use CoreShop\Component\Order\Checkout\RedirectCheckoutStepInterface;
use CoreShop\Component\Order\Checkout\ValidationCheckoutStepInterface;
use CoreShop\Component\Order\CheckoutEvents;
use CoreShop\Component\Order\Context\CartContextInterface;
use CoreShop\Component\Order\Event\CheckoutEvent;
use CoreShop\Component\Order\OrderPaymentTransitions;
use CoreShop\Component\Order\OrderSaleStates;
use CoreShop\Component\Order\OrderSaleTransitions;
use CoreShop\Component\Order\OrderTransitions;
use CoreShop\Component\Order\Repository\OrderRepositoryInterface;
use CoreShop\Component\Resource\TokenGenerator\UniqueTokenGenerator;
use CoreShop\Component\Tracking\Tracker\TrackerInterface;
use Payum\Core\Payum;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

class CheckoutController extends FrontendController
{
    public function processAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('CORESHOP_CHECKOUT');

        if (!$this->getCart()->hasItems()) {
            return $this->redirectToRoute('coreshop_cart_summary');
        }

        $checkoutManager = $this->getCheckoutManagerFactory()->createCheckoutManager($this->getCart());

        $stepIdentifier = $this->getParameterFromRequest($request, 'stepIdentifier');
        $step = $checkoutManager->getStep($stepIdentifier);
        $dataForStep = [];
        $cart = $this->getCart();

        if (!$step instanceof CheckoutStepInterface) {
            return $this->redirectToRoute('coreshop_index');
        }

        //Check all previous steps if they are valid, if not, redirect back
        foreach ($checkoutManager->getPreviousSteps($stepIdentifier) as $previousStep) {
            if ($previousStep instanceof ValidationCheckoutStepInterface && !$previousStep->validate($cart)) {
                return $this->redirectToRoute('coreshop_checkout', $this->stepParams($request, $previousStep->getIdentifier()));
            }
        }

        $isValid = $step instanceof ValidationCheckoutStepInterface ? $step->validate($cart) : true;
        if ($isValid && $step->doAutoForward($cart)) {
            $nextStep = $checkoutManager->getNextStep($stepIdentifier);
            if ($nextStep) {
                return $this->redirectToRoute('coreshop_checkout', $this->stepParams($request, $nextStep->getIdentifier()));
            }
        }

        $event = new CheckoutEvent($this->getCart(), ['step' => $step, 'step_identifier', $stepIdentifier]);

        $this->container->get('event_dispatcher')->dispatch($event, CheckoutEvents::CHECKOUT_STEP_PRE);

        if ($event->isStopped()) {
            $this->addEventFlash($event->getMessageType(), $event->getMessage(), $event->getMessageParameters());

            if ($event->hasResponse()) {
                return $event->getResponse();
            }

            return $this->redirectToRoute('coreshop_index');
        }

        if ($request->isMethod('POST')) {
            try {
                if ($step->commitStep($cart, $request)) {
                    $response = null;

                    if ($step instanceof RedirectCheckoutStepInterface) {
                        $response = $step->getResponse($cart, $request);
                    } else {
                        $nextStep = $checkoutManager->getNextStep($stepIdentifier);

                        if ($nextStep) {
                            $response = $this->redirectToRoute('coreshop_checkout', $this->stepParams($request, $nextStep->getIdentifier()));
                        }
                    }

                    //last step needs to tell us where to go!
                    if (!$checkoutManager->hasNextStep($stepIdentifier) && !$response instanceof Response) {
                        throw new \InvalidArgumentException(sprintf('Last step was executed, but no Response has been generated. To solve your issue, have a look at the last Checkout step %s and implement %s interface', $step->getIdentifier(), RedirectCheckoutStepInterface::class));
                    }

                    return $response;
                }
            } catch (CheckoutException $ex) {
                $dataForStep['exception'] = $ex->getTranslatableText();
            }
        }

        $isFirstStep = $checkoutManager->hasPreviousStep($stepIdentifier) === false;
        $this->container->get(TrackerInterface::class)->trackCheckoutStep($cart, $checkoutManager->getCurrentStepIndex($stepIdentifier), $isFirstStep);

        $preparedData = array_merge($dataForStep, $checkoutManager->prepareStep($step, $cart, $request));

        $dataForStep = array_merge($preparedData, [
            'cart' => $cart,
            'step' => $step,
            'identifier' => $stepIdentifier,
        ]);

        $event = new CheckoutEvent($this->getCart(), ['step' => $step, 'step_identifier', $stepIdentifier, 'step_params' => $dataForStep]);

        $this->container->get('event_dispatcher')->dispatch($event, CheckoutEvents::CHECKOUT_STEP_POST);

        if ($event->isStopped()) {
            $this->addEventFlash($event->getMessageType(), $event->getMessage(), $event->getMessageParameters());

            if ($event->hasResponse()) {
                return $event->getResponse();
            }

            return $this->redirectToRoute('coreshop_index');
        }

        return $this->renderResponseForCheckoutStep($request, $step, $stepIdentifier, $dataForStep);
    }

    protected function renderResponseForCheckoutStep(Request $request, CheckoutStepInterface $step, string $stepIdentifier, array $dataForStep): Response
    {
        $template = $this->getTemplateConfigurator()->findTemplate(sprintf('Checkout/steps/%s.html', $stepIdentifier));

        return $this->render($template, $dataForStep);
    }

    public function doCheckoutAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('CORESHOP_ORDER_CREATE');

        $cart = $this->getCart();
        $checkoutManager = $this->getCheckoutManagerFactory()->createCheckoutManager($cart);

        /*
         * after the last step, we come here
         *
         * what are we doing here?
         *  1. Commit Order (eg. change state)
         *  2. Use Payum and redirect to Payment Provider
         *  3. PayumBundle takes care about payment stuff
         *  4. After Payment is done, we return to PayumBundle PaymentController and further process it
         *
         * therefore we need the CartToOrderTransformerInterface here
        */

        /*
         * Before we do anything else, lets check if the checkout is still valid
         * Check all previous steps if they are valid, if not, redirect back
         */

        foreach ($checkoutManager->getSteps() as $stepIdentifier) {
            /**
             * @var CheckoutStepInterface $step
             */
            $step = $checkoutManager->getStep($stepIdentifier);

            if ($step instanceof CheckoutStepInterface && $step instanceof ValidationCheckoutStepInterface && !$step->validate($this->getCart())) {
                return $this->redirectToRoute('coreshop_checkout', $this->stepParams($request, $step->getIdentifier()));
            }
        }

        $event = new CheckoutEvent($this->getCart());

        $this->container->get('event_dispatcher')->dispatch($event, CheckoutEvents::CHECKOUT_DO_PRE);

        if ($event->isStopped()) {
            $this->addEventFlash($event->getMessageType(), $event->getMessage(), $event->getMessageParameters());

            if ($event->hasResponse()) {
                return $event->getResponse();
            }

            return $this->redirectToRoute('coreshop_index');
        }

        /**
         * If everything is valid, we continue with Order-Creation.
         */
        $order = $this->getCart();

        //Fallback for Orders/Carts without token (eg. legacy carts)
        //will be removed in future
        //@Todo: remove with CoreShop 5.0
        if (!$order->getToken()) {
            $tokenGenerator = new UniqueTokenGenerator();
            $order->setToken($tokenGenerator->generate(10));
            $order->save();
        }

        $workflow = $this->container->get(StateMachineManagerInterface::class)->get($order, OrderSaleTransitions::IDENTIFIER);

        if ($order->getSaleState() !== OrderSaleStates::STATE_ORDER) {
            $workflow->apply($order, OrderSaleTransitions::TRANSITION_ORDER);
        }

        $event = new CheckoutEvent($this->getCart(), ['order' => $order]);

        $this->container->get('event_dispatcher')->dispatch($event, CheckoutEvents::CHECKOUT_PAYMENT_PRE);

        if ($event->isStopped()) {
            $this->addEventFlash($event->getMessageType(), $event->getMessage(), $event->getMessageParameters());

            if ($event->hasResponse()) {
                return $event->getResponse();
            }
        }

        if ($event->hasResponse()) {
            return $event->getResponse();
        }

        $response = $this->redirectToRoute('coreshop_payment_token', ['token' => (string) $order->getToken()]);

        if (0 === $order->getTotal()) {
            $orderStateMachine = $this->container->get(StateMachineManagerInterface::class)->get($order, 'coreshop_order');
            $orderPaymentStateMachine = $this->container->get(StateMachineManagerInterface::class)->get($order, 'coreshop_order_payment');

            if ($orderStateMachine->can($order, OrderTransitions::TRANSITION_CONFIRM)) {
                $orderStateMachine->apply($order, OrderTransitions::TRANSITION_CONFIRM);
            }

            if ($orderPaymentStateMachine->can($order, OrderPaymentTransitions::TRANSITION_PAY)) {
                $orderPaymentStateMachine->apply($order, OrderPaymentTransitions::TRANSITION_PAY);
            }

            $this->container->get('event_dispatcher')->dispatch(new CheckoutEvent($this->getCart(), ['order' => $order]), CheckoutEvents::CHECKOUT_DO_POST);

            $response = $this->redirectToRoute('coreshop_checkout_thank_you', ['token' => $order->getToken()]);
        }

        $event = new CheckoutEvent($this->getCart(), ['order' => $order]);

        $this->container->get('event_dispatcher')->dispatch($event, CheckoutEvents::CHECKOUT_DO_POST);

        if ($event->isStopped()) {
            $this->addEventFlash($event->getMessageType(), $event->getMessage(), $event->getMessageParameters());

            if ($event->hasResponse()) {
                return $event->getResponse();
            }

            return $this->redirectToRoute('coreshop_index');
        }

        /*
         * TODO: Not sure if we should create payment object right here, if so, the PaymentBundle would'nt be responsible for it :/
        */
        return $response;
    }

    public function thankYouAction(Request $request): Response
    {
        $orderToken = $this->getParameterFromRequest($request, 'token');

        if (null === $orderToken) {
            return $this->redirectToRoute('coreshop_index');
        }

        $order = $this->container->get('coreshop.repository.order')->findByToken($orderToken);

        if (null === $order) {
            return $this->redirectToRoute('coreshop_index');
        }

        $this->container->get(TrackerInterface::class)->trackCheckoutComplete($order);

        return $this->render($this->getTemplateConfigurator()->findTemplate('Checkout/thank-you.html'), [
            'order' => $order,
        ]);
    }

    public static function getSubscribedServices(): array
    {
        return array_merge(
            parent::getSubscribedServices(),
            [
                'coreshop.checkout_manager.factory' => CheckoutManagerFactoryInterface::class,
                'coreshop.repository.order' => OrderRepositoryInterface::class,
                'event_dispatcher' => EventDispatcherInterface::class,
                TrackerInterface::class => TrackerInterface::class,
                StateMachineManagerInterface::class,
            ],
        );
    }

    protected function getCheckoutManagerFactory(): CheckoutManagerFactoryInterface
    {
        return $this->container->get('coreshop.checkout_manager.factory');
    }

    protected function addEventFlash(string $type, ?string $message = null, array $parameters = []): void
    {
        if (!$message) {
            return;
        }

        $actualMessage = $message;

        if (!empty($parameters)) {
            $actualMessage = $this->prepareMessage($message, $parameters);
        }

        $this->addFlash($type, $actualMessage);
    }

    protected function stepParams(Request $request, string $stepIdentifier)
    {
        $params = [];
        $params['stepIdentifier'] = $stepIdentifier;

        return $params;
    }

    private function prepareMessage(string $message, array $parameters): array
    {
        return [
            'message' => $message,
            'parameters' => $parameters,
        ];
    }

    protected function getCart(): OrderInterface
    {
        /**
         * @var OrderInterface $cart
         */
        $cart = $this->getCartContext()->getCart();

        return $cart;
    }

    protected function getCartContext(): CartContextInterface
    {
        return $this->container->get(CartContextInterface::class);
    }

    protected function getPayum(): Payum
    {
        return $this->container->get('payum');
    }
}

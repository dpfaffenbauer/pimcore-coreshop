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

use CoreShop\Bundle\OrderBundle\DTO\AddToCartInterface;
use CoreShop\Bundle\OrderBundle\Factory\AddToCartFactoryInterface;
use CoreShop\Bundle\OrderBundle\Form\Type\AddToCartType;
use CoreShop\Bundle\OrderBundle\Form\Type\CartListType;
use CoreShop\Bundle\OrderBundle\Form\Type\CartType;
use CoreShop\Bundle\OrderBundle\Form\Type\ShippingCalculatorType;
use CoreShop\Bundle\ResourceBundle\Pimcore\Repository\StackRepositoryInterface;
use CoreShop\Bundle\WorkflowBundle\Manager\StateMachineManagerInterface;
use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Core\Context\ShopperContextInterface;
use CoreShop\Component\Core\Order\Modifier\CartItemQuantityModifier;
use CoreShop\Component\Order\Cart\CartModifierInterface;
use CoreShop\Component\Order\Cart\Rule\CartPriceRuleProcessorInterface;
use CoreShop\Component\Order\Cart\Rule\CartPriceRuleUnProcessorInterface;
use CoreShop\Component\Order\Context\CartContextInterface;
use CoreShop\Component\Order\Factory\OrderItemFactoryInterface;
use CoreShop\Component\Order\Manager\CartManagerInterface;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherCodeInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\OrderItemInterface;
use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\Order\OrderSaleTransitions;
use CoreShop\Component\Order\Repository\CartPriceRuleVoucherRepositoryInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use CoreShop\Component\Shipping\Calculator\TaxedShippingCalculatorInterface;
use CoreShop\Component\Shipping\Resolver\CarriersResolverInterface;
use CoreShop\Component\StorageList\Factory\StorageListFactory;
use CoreShop\Component\StorageList\Provider\ContextProviderInterface;
use CoreShop\Component\StorageList\Storage\StorageListStorageInterface;
use CoreShop\Component\StorageList\StorageListItemQuantityModifierInterface;
use CoreShop\Component\Tracking\Tracker\TrackerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\GenericEvent;
use Symfony\Component\Form\FormError;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;
use Symfony\Contracts\Service\Attribute\SubscribedService;

class CartController extends FrontendController
{
    public function widgetAction(Request $request): Response
    {
        $multiCartEnabled = $this->getParameter('coreshop.storage_list.multi_list.order');

        $params = [
            'cart' => $this->getCart(),
            'multi_cart_enabled' => $this->getParameter('coreshop.storage_list.multi_list.order'),
        ];

        if ($multiCartEnabled) {
            $form = $this->container->get('form.factory')->createNamed('coreshop', CartListType::class, ['list' => $this->getCart()], [
                'context' => $this->container->get(ShopperContextInterface::class)->getContext(),
            ]);

            $params['form'] = $form->createView();
        }

        return $this->render($this->getTemplateConfigurator()->findTemplate('Cart/_widget.html'), $params);
    }

    public function createQuoteAction(Request $request, StateMachineManagerInterface $machineManager)
    {
        $this->denyAccessUnlessGranted('CORESHOP_QUOTE_CREATE');

        $order = $this->getCart();
        $workflow = $machineManager->get($order, OrderSaleTransitions::IDENTIFIER);
        $workflow->apply($order, OrderSaleTransitions::TRANSITION_QUOTE);

        return $this->redirectToRoute('coreshop_quote_detail', ['quote' => $order->getId()]);
    }

    public function summaryAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('CORESHOP_CART');
        $this->denyAccessUnlessGranted('CORESHOP_CART_SUMMARY');

        $cart = $this->getCart();
        $form = $this->container->get('form.factory')->createNamed('coreshop', CartType::class, $cart);
        $form->handleRequest($request);

        if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH']) && $form->isSubmitted()) {
            if ($form->isValid()) {
                $cart = $form->getData();
                $code = $form->get('cartRuleCoupon')->getData();

                if (method_exists($form, 'getClickedButton')) {
                    $submit = $form->getClickedButton();
                    $validateVoucherCode = $submit && 'submit_voucher' === $submit->getName();
                } else {
                    $validateVoucherCode = (bool) $code;
                }

                if ($validateVoucherCode) {
                    $voucherCode = $this->getCartPriceRuleVoucherRepository()->findByCode($code ?? '');

                    if (!$voucherCode instanceof CartPriceRuleVoucherCodeInterface) {
                        $this->addFlash(
                            'error',
                            $this->container->get('translator')->trans('coreshop.ui.error.voucher.not_found'),
                        );

                        return $this->redirectToRoute('coreshop_cart_summary');
                    }

                    $priceRule = $voucherCode->getCartPriceRule();

                    if ($this->getCartPriceRuleProcessor()->process($cart, $priceRule, $voucherCode)) {
                        $this->getCartManager()->persistCart($cart);
                        $this->addFlash(
                            'success',
                            $this->container->get('translator')->trans('coreshop.ui.success.voucher.stored'),
                        );
                    } else {
                        $this->addFlash('error', $this->container->get('translator')->trans('coreshop.ui.error.voucher.invalid'));
                    }
                } else {
                    $this->addFlash('success', $this->container->get('translator')->trans('coreshop.ui.cart_updated'));
                }

                $this->container->get('event_dispatcher')->dispatch(new GenericEvent($cart), 'coreshop.cart.update');
                $this->getCartManager()->persistCart($cart);

                return $this->redirectToRoute('coreshop_cart_summary');
            }

            $session = $request->getSession();

            if ($session instanceof Session) {
                foreach ($form->getErrors() as $error) {
                    $session->getFlashBag()->add('error', $error->getMessage());
                }

                return $this->redirectToRoute('coreshop_cart_summary');
            }
        }

        return $this->render($this->getTemplateConfigurator()->findTemplate('Cart/summary.html'), [
            'cart' => $cart,
            'form' => $form->createView(),
        ]);
    }

    public function shipmentCalculationAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('CORESHOP_CART');
        $this->denyAccessUnlessGranted('CORESHOP_CART_CALCULATE_SHIPMENT');

        $cart = $this->getCart();
        $form = $this->container->get('form.factory')->createNamed('coreshop', ShippingCalculatorType::class, null, [
            'action' => $this->generateUrl('coreshop_cart_check_shipment'),
        ]);

        $availableCarriers = [];
        $form->handleRequest($request);

        //check if there is a shipping calculation request
        if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH']) && $form->isSubmitted() && $form->isValid()) {
            $shippingCalculatorFormData = $form->getData();
            $carrierPriceCalculator = $this->container->get(TaxedShippingCalculatorInterface::class);
            $carriersResolver = $this->container->get(CarriersResolverInterface::class);

            /** @var AddressInterface $virtualAddress */
            $virtualAddress = $this->container->get('coreshop.factory.address')->createNew();
            $virtualAddress->setCountry($shippingCalculatorFormData['country']);
            $virtualAddress->setPostcode($shippingCalculatorFormData['zip']);

            $carriers = $carriersResolver->resolveCarriers($cart, $virtualAddress);
            foreach ($carriers as $carrier) {
                $price = $carrierPriceCalculator->getPrice($carrier, $cart, $virtualAddress);
                $priceWithoutTax = $carrierPriceCalculator->getPrice($carrier, $cart, $virtualAddress, false);
                $availableCarriers[] = [
                    'name' => $carrier->getTitle(),
                    'isFreeShipping' => $price === 0,
                    'price' => $price,
                    'priceWithoutTax' => $priceWithoutTax,
                    'data' => $carrier,
                ];
            }
            uasort($availableCarriers, function ($a, $b) {
                return $a['price'] > $b['price'];
            });
        }

        return $this->render($this->getTemplateConfigurator()->findTemplate('Cart/ShipmentCalculator/_widget.html'), [
            'cart' => $cart,
            'form' => $form->createView(),
            'availableCarriers' => $availableCarriers,
        ]);
    }

    public function addItemAction(Request $request): Response
    {
        if ($request->isMethod('GET') && !($this->isGranted('CORESHOP_CART') && $this->isGranted('CORESHOP_CART_ADD_ITEM'))) {
            return $this->render(
                $this->getParameterFromRequest($request, 'template', $this->getTemplateConfigurator()->findTemplate('Product/_addToCart.html')),
                [
                    'form' => null,
                    'product' => null,
                ],
            );
        }
        $this->denyAccessUnlessGranted('CORESHOP_CART');
        $this->denyAccessUnlessGranted('CORESHOP_CART_ADD_ITEM');

        $redirect = $this->getParameterFromRequest($request, '_redirect', $this->generateUrl('coreshop_index'));

        $product = $this->container->get('coreshop.repository.stack.purchasable')->find($this->getParameterFromRequest($request, 'product'));

        if (!$product instanceof PurchasableInterface) {
            if ($request->isXmlHttpRequest()) {
                return new JsonResponse([
                    'success' => false,
                ]);
            }

            return $this->redirect($redirect);
        }

        $cartItem = $this->container->get('coreshop.factory.order_item')->createWithPurchasable($product);

        $this->getQuantityModifer()->modify($cartItem, 1);

        $addToCart = $this->createAddToCart($this->getCart(), $cartItem);

        $form = $this->container->get('form.factory')->createNamed('coreshop-' . $product->getId(), AddToCartType::class, $addToCart);

        if ($request->isMethod('POST')) {
            $redirect = $this->getParameterFromRequest($request, '_redirect', $this->generateUrl('coreshop_cart_summary'));

            $form->handleRequest($request);

            if ($form->isSubmitted() && $form->isValid()) {
                /**
                 * @var AddToCartInterface $addToCart
                 */
                $addToCart = $form->getData();

                $this->getCartModifier()->addToList($addToCart->getCart(), $addToCart->getCartItem());
                $this->getCartManager()->persistCart($this->getCart());

                $this->container->get(TrackerInterface::class)->trackCartAdd(
                    $addToCart->getCart(),
                    $addToCart->getCartItem()->getProduct(),
                    $addToCart->getCartItem()->getQuantity(),
                );

                $this->addFlash('success', $this->container->get('translator')->trans('coreshop.ui.item_added'));

                if ($request->isXmlHttpRequest()) {
                    return new JsonResponse([
                        'success' => true,
                    ]);
                }

                return $this->redirect($redirect);
            }

            foreach ($form->getErrors(true, true) as $error) {
                $this->addFlash('error', $error->getMessage());
            }

            if ($request->isXmlHttpRequest()) {
                return new JsonResponse([
                    'success' => false,
                    'errors' => array_map(function (FormError $error) {
                        return $error->getMessage();
                    }, iterator_to_array($form->getErrors(true))),
                ]);
            }

            return $this->redirect($redirect);
        }

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse([
                'success' => false,
            ]);
        }

        return $this->render(
            $this->getParameterFromRequest($request, 'template', $this->getTemplateConfigurator()->findTemplate('Product/_addToCart.html')),
            [
                'form' => $form->createView(),
                'product' => $product,
            ],
        );
    }

    public function removeItemAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('CORESHOP_CART');
        $this->denyAccessUnlessGranted('CORESHOP_CART_REMOVE_ITEM');

        $cartItem = $this->container->get('coreshop.repository.order_item')->find($this->getParameterFromRequest($request, 'cartItem'));

        if (!$cartItem instanceof OrderItemInterface) {
            return $this->redirectToRoute('coreshop_index');
        }

        if ($cartItem->getOrder()->getId() !== $this->getCart()->getId()) {
            return $this->redirectToRoute('coreshop_index');
        }

        $this->addFlash('success', $this->container->get('translator')->trans('coreshop.ui.item_removed'));

        $this->getCartModifier()->removeFromList($this->getCart(), $cartItem);
        $this->getCartManager()->persistCart($this->getCart());

        $request->attributes->set('product', $cartItem->getProduct());

        $this->container->get(TrackerInterface::class)->trackCartRemove($this->getCart(), $cartItem->getProduct(), $cartItem->getQuantity());

        return $this->redirectToRoute('coreshop_cart_summary');
    }

    public function removePriceRuleAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('CORESHOP_CART');
        $this->denyAccessUnlessGranted('CORESHOP_CART_REMOVE_PRICE_RULE');

        $code = $this->getParameterFromRequest($request, 'code');
        $cart = $this->getCart();

        $voucherCode = $this->getCartPriceRuleVoucherRepository()->findByCode($code);

        if (!$voucherCode instanceof CartPriceRuleVoucherCodeInterface) {
            return $this->redirectToRoute('coreshop_cart_summary');
        }

        $priceRule = $voucherCode->getCartPriceRule();

        $this->getCartPriceRuleUnProcessor()->unProcess($cart, $priceRule, $voucherCode);
        $this->getCartManager()->persistCart($cart);

        return $this->redirectToRoute('coreshop_cart_summary');
    }

    protected function createAddToCart(OrderInterface $cart, OrderItemInterface $cartItem): AddToCartInterface
    {
        return $this->container->get(AddToCartFactoryInterface::class)->createWithCartAndCartItem($cart, $cartItem);
    }

    protected function getCartPriceRuleProcessor(): CartPriceRuleProcessorInterface
    {
        return $this->container->get(CartPriceRuleProcessorInterface::class);
    }

    protected function getCartPriceRuleUnProcessor(): CartPriceRuleUnProcessorInterface
    {
        return $this->container->get(CartPriceRuleUnProcessorInterface::class);
    }

    protected function getCartModifier(): CartModifierInterface
    {
        return $this->container->get(CartModifierInterface::class);
    }

    protected function getQuantityModifer(): StorageListItemQuantityModifierInterface
    {
        return $this->container->get(CartItemQuantityModifier::class);
    }

    protected function getCartPriceRuleVoucherRepository(): CartPriceRuleVoucherRepositoryInterface
    {
        return $this->container->get('coreshop.repository.cart_price_rule_voucher_code');
    }

    protected function getCart(): OrderInterface
    {
        return $this->getCartContext()->getCart();
    }

    protected function getCartContext(): CartContextInterface
    {
        return $this->container->get(CartContextInterface::class);
    }

    protected function getCartManager(): CartManagerInterface
    {
        return $this->container->get(CartManagerInterface::class);
    }

    public static function getSubscribedServices(): array
    {
        return array_merge(
            parent::getSubscribedServices(),
            [
                new SubscribedService('coreshop.repository.stack.purchasable', StackRepositoryInterface::class, attributes: new Autowire(service: 'coreshop.repository.stack.purchasable')),
                new SubscribedService('coreshop.factory.order_item', OrderItemFactoryInterface::class, attributes: new Autowire(service: 'coreshop.factory.order_item')),
                new SubscribedService('coreshop.factory.order', StorageListFactory::class, attributes: new Autowire(service: 'coreshop.factory.order')),
                new SubscribedService('coreshop.repository.order_item', RepositoryInterface::class, attributes: new Autowire(service: 'coreshop.repository.order_item')),
                new SubscribedService(CartItemQuantityModifier::class, CartItemQuantityModifier::class),
                new SubscribedService(AddToCartFactoryInterface::class, AddToCartFactoryInterface::class),
                new SubscribedService(CartModifierInterface::class, CartModifierInterface::class),
                new SubscribedService(CartManagerInterface::class, CartManagerInterface::class),
                new SubscribedService(TrackerInterface::class, TrackerInterface::class),
                new SubscribedService('event_dispatcher', EventDispatcherInterface::class),
                new SubscribedService('coreshop.repository.cart_price_rule_voucher_code', CartPriceRuleVoucherRepositoryInterface::class),
                new SubscribedService(CartPriceRuleProcessorInterface::class, CartPriceRuleProcessorInterface::class),
                new SubscribedService(CartPriceRuleUnProcessorInterface::class, CartPriceRuleUnProcessorInterface::class),
                new SubscribedService('coreshop.storage', CartPriceRuleUnProcessorInterface::class),
                new SubscribedService('coreshop.storage_list.context_provider.order', ContextProviderInterface::class, attributes: new Autowire(service: 'coreshop.storage_list.context_provider.order')),
                new SubscribedService('coreshop.storage_list.storage.order', StorageListStorageInterface::class, attributes: new Autowire(service: 'coreshop.storage_list.storage.order')),
            ],
        );
    }

    private function getCartItemErrors(OrderItemInterface $cartItem): ConstraintViolationListInterface
    {
        return $this
            ->container->get('validator')
            ->validate($cartItem, null, $this->getParameter('coreshop.form.type.cart_item.validation_groups'))
        ;
    }
}

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

namespace CoreShop\Bundle\OrderBundle\Controller;

use Carbon\Carbon;
use CoreShop\Bundle\OrderBundle\Events;
use CoreShop\Bundle\OrderBundle\Form\Type\OrderType;
use CoreShop\Bundle\ResourceBundle\Controller\PimcoreController;
use CoreShop\Bundle\WorkflowBundle\History\HistoryLogger;
use CoreShop\Bundle\WorkflowBundle\Manager\StateMachineManagerInterface;
use CoreShop\Bundle\WorkflowBundle\StateManager\WorkflowStateInfoManagerInterface;
use CoreShop\Component\Address\Formatter\AddressFormatterInterface;
use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Address\Model\CountryInterface;
use CoreShop\Component\Currency\Model\CurrencyInterface;
use CoreShop\Component\Customer\Model\CustomerInterface;
use CoreShop\Component\Order\Manager\CartManagerInterface;
use CoreShop\Component\Order\Model\CartPriceRuleInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\OrderItemInterface;
use CoreShop\Component\Order\Model\PriceRuleItemInterface;
use CoreShop\Component\Order\Notes;
use CoreShop\Component\Order\OrderEditPossibleInterface;
use CoreShop\Component\Order\OrderInvoiceStates;
use CoreShop\Component\Order\OrderPaymentStates;
use CoreShop\Component\Order\OrderShipmentStates;
use CoreShop\Component\Order\OrderStates;
use CoreShop\Component\Order\OrderTransitions;
use CoreShop\Component\Order\Processable\ProcessableInterface;
use CoreShop\Component\Order\Processor\CartProcessorInterface;
use CoreShop\Component\Order\Repository\OrderInvoiceRepositoryInterface;
use CoreShop\Component\Order\Repository\OrderItemRepositoryInterface;
use CoreShop\Component\Order\Repository\OrderRepositoryInterface;
use CoreShop\Component\Order\Repository\OrderShipmentRepositoryInterface;
use CoreShop\Component\Payment\Repository\PaymentRepositoryInterface;
use CoreShop\Component\Pimcore\DataObject\DataLoader;
use CoreShop\Component\Pimcore\DataObject\InheritanceHelper;
use CoreShop\Component\Pimcore\DataObject\NoteServiceInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use JMS\Serializer\SerializerInterface;
use Pimcore\Model\DataObject;
use Pimcore\Model\User;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\Attribute\TaggedIterator;
use Symfony\Component\EventDispatcher\GenericEvent;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Workflow\WorkflowInterface;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;
use Symfony\Contracts\Service\Attribute\SubscribedService;

class OrderController extends PimcoreController
{
    public function getStatesAction(Request $request): Response
    {
        /**
         * @var array $identifiers
         */
        $identifiers = $this->getParameter('coreshop.state_machines');
        $states = [];
        $transitions = [];
        $worklows = $this->container->get('workflows');

        /**
         * @var \Pimcore\Security\User\User $user
         */
        $user = $this->getUser();
        $locale = $user->getUser()->getLanguage();

        foreach ($identifiers as $identifier) {
            $stateMachine = null;

            foreach ($worklows as $workflow) {
                if (!$workflow instanceof WorkflowInterface) {
                    continue;
                }

                if ($workflow->getName() === $identifier) {
                    $stateMachine = $workflow;

                    break;
                }
            }

            if (null === $stateMachine) {
                continue;
            }

            $transitions[$identifier] = [];
            $states[$identifier] = [];
            $places = $stateMachine->getDefinition()->getPlaces();
            $machineTransitions = $stateMachine->getDefinition()->getTransitions();

            foreach ($places as $place) {
                $states[$identifier][] = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
                    $identifier,
                    $place,
                    false,
                    $locale,
                );
            }

            foreach ($machineTransitions as $transition) {
                if (!array_key_exists($transition->getName(), $transitions[$identifier])) {
                    $transitions[$identifier][$transition->getName()] = [
                        'name' => $transition->getName(),
                        'froms' => [],
                        'tos' => [],
                    ];
                }

                $transitions[$identifier][$transition->getName()]['froms'] =
                    array_merge(
                        $transitions[$identifier][$transition->getName()]['froms'],
                        $transition->getFroms(),
                    );

                $transitions[$identifier][$transition->getName()]['tos'] =
                    array_merge(
                        $transitions[$identifier][$transition->getName()]['tos'],
                        $transition->getFroms(),
                    );
            }

            $transitions[$identifier] = array_values($transitions[$identifier]);
        }

        return $this->viewHandler->handle(['success' => true, 'states' => $states, 'transitions' => $transitions]);
    }

    public function updateOrderStateAction(
        Request $request,
        OrderRepositoryInterface $orderRepository,
        StateMachineManagerInterface $stateMachineManager,
    ): Response {
        $orderId = $this->getParameterFromRequest($request, 'id');
        $transition = $this->getParameterFromRequest($request, 'transition');
        $order = $orderRepository->find($orderId);

        if (!$order instanceof OrderInterface) {
            throw new \Exception('invalid order');
        }

        //apply state machine
        $workflow = $stateMachineManager->get($order, 'coreshop_order');
        if (!$workflow->can($order, $transition)) {
            return $this->viewHandler->handle(['success' => false, 'message' => 'this transition is not allowed.']);
        }

        $workflow->apply($order, $transition);

        if ($order instanceof DataObject\Concrete && $transition === OrderTransitions::TRANSITION_CANCEL) {
            $this->container->get(HistoryLogger::class)->log(
                $order,
                'Admin Order Cancellation',
            );
        }

        return $this->viewHandler->handle(['success' => true]);
    }

    public function getFolderConfigurationAction(Request $request): Response
    {
        $this->isGrantedOr403();

        $name = null;
        $folderId = null;

        $type = $this->getParameterFromRequest($request, 'saleType', 'order');

        $orderClassId = (string) $this->getParameter('coreshop.model.order.pimcore_class_name');
        $folderPath = (string) $this->getParameter('coreshop.folder.' . $type);
        $orderClassDefinition = DataObject\ClassDefinition::getByName($orderClassId);

        $folder = DataObject::getByPath('/' . $folderPath);

        if ($folder instanceof DataObject\Folder) {
            $folderId = $folder->getId();
        }

        if ($orderClassDefinition instanceof DataObject\ClassDefinition) {
            $name = $orderClassDefinition->getName();
        }

        return $this->viewHandler->handle(['success' => true, 'className' => $name, 'folderId' => $folderId]);
    }

    public function detailAction(Request $request, OrderRepositoryInterface $orderRepository): Response
    {
        $this->isGrantedOr403();

        $orderId = $this->getParameterFromRequest($request, 'id');
        $order = $orderRepository->find($orderId);

        if (!$order instanceof OrderInterface) {
            return $this->viewHandler->handle(['success' => false, 'message' => "Order with ID '$orderId' not found"]);
        }

        /**
         * @var \Pimcore\Security\User\User $user
         */
        $user = $this->getUser();

        $jsonSale = $this->getDetails($order, $user->getUser()->getLanguage());

        return $this->viewHandler->handle(['success' => true, 'sale' => $jsonSale]);
    }

    public function updateAction(
        Request $request,
        OrderRepositoryInterface $orderRepository,
        OrderItemRepositoryInterface $orderItemRepository,
        FormFactoryInterface $formFactory,
        CartManagerInterface $cartManager,
        CartProcessorInterface $cartProcessor,
    ): Response {
        $this->isGrantedOr403();

        $orderId = $this->getParameterFromRequest($request, 'id');
        $order = $orderRepository->find($orderId);

        if (!$order instanceof OrderInterface) {
            throw $this->createNotFoundException();
        }

        $form = $formFactory->createNamed('', OrderType::class, $order, [
            'allow_zero_quantity' => true,
        ]);

        $previewOnly = $request->query->getBoolean('preview');

        if ($request->getMethod() === 'POST') {
            $handledForm = $form->handleRequest($request);

            /**
             * @var OrderInterface&DataObject\Concrete $order
             */
            $order = $handledForm->getData();

            $changedOrderItems = [];

            InheritanceHelper::useInheritedValues(
                function () use ($cartManager, $cartProcessor, $previewOnly, $order, $orderItemRepository, &$changedOrderItems) {
                    if ($previewOnly) {
                        $cartProcessor->process($order);
                    } else {
                        $commentEntity = $this->container->get(NoteServiceInterface::class)->createPimcoreNoteInstance($order, Notes::NOTE_ORDER_BACKEND_UPDATE_SAVE);
                        $commentEntity->setTitle('Order Backend Update');
                        $commentEntity->setDescription('Order has been updated manually from backend');

                        $items = $order->getItems();

                        /**
                         * @var OrderItemInterface&DataObject\Concrete $orderItem
                         */
                        foreach ($items as $index => $orderItem) {
                            $originalCartItem = $orderItemRepository->forceFind($orderItem->getId());

                            if (!$originalCartItem instanceof $orderItem) {
                                continue;
                            }

                            if ($originalCartItem->getQuantity() !== $orderItem->getQuantity()) {
                                $commentEntity->addData('item_from_' . $index, 'text', $originalCartItem->getQuantity());
                                $commentEntity->addData('item_to_' . $index, 'text', $orderItem->getQuantity());

                                $itemNote = $this->container->get(NoteServiceInterface::class)->createPimcoreNoteInstance($orderItem, Notes::NOTE_ORDER_BACKEND_UPDATE_SAVE);
                                $itemNote->setTitle('Order Item Backend Update');
                                $itemNote->setDescription('Order Item has been updated manually from backend');
                                $itemNote->addData('from', 'text', $originalCartItem->getQuantity());
                                $itemNote->addData('to', 'text', $orderItem->getQuantity());

                                $this->container->get(NoteServiceInterface::class)->storeNote($itemNote, ['item' => $orderItem, 'originalItem' => $originalCartItem]);

                                $changedOrderItems[] = [
                                    'orderItem' => $orderItem,
                                    'originalOrderItem' => $originalCartItem,
                                    'from' => $originalCartItem->getQuantity(),
                                    'to' => $orderItem->getQuantity(),
                                ];
                            }
                        }

                        /**
                         * @psalm-suppress TooManyArguments
                         *
                         * @phpstan-ignore-next-line
                         */
                        $cartManager->persistCart($order, ['enable_versioning' => true]);

                        $this->container->get(NoteServiceInterface::class)->storeNote($commentEntity, ['order' => $order]);
                    }
                },
            );

            $this->container->get('event_dispatcher')->dispatch(
                new GenericEvent($order, [
                    'changedOrderItems' => $changedOrderItems,
                ]),
                $previewOnly ? Events::ORDER_BACKEND_UPDATE_PREVIEW : Events::ORDER_BACKEND_UPDATE_SAVE,
            );

            $json = $this->getDetails($order);

            return $this->viewHandler->handle(['success' => true, 'sale' => $json]);
        }

        return $this->viewHandler->handle(['success' => false, 'message' => 'Method not supported, use POST']);
    }

    public function findOrderAction(Request $request, OrderRepositoryInterface $orderRepository): Response
    {
        $this->isGrantedOr403();

        $number = $this->getParameterFromRequest($request, 'number');

        if ($number) {
            $list = $orderRepository->getList();
            $list->setCondition('orderNumber = ? OR id = ?', [$number, $number]);

            $orders = $list->getData();

            if (count($orders) > 0) {
                return $this->viewHandler->handle(['success' => true, 'id' => $orders[0]->getId()]);
            }
        }

        return $this->viewHandler->handle(['success' => false]);
    }

    protected function prepareAddress(AddressInterface $address, string $type): array
    {
        $prefix = 'address' . ucfirst($type);
        $values = [];
        $fullAddress = [];
        $classDefinition = DataObject\ClassDefinition::getByName(
            (string) $this->getParameter('coreshop.model.address.pimcore_class_name'),
        );

        foreach ($classDefinition->getFieldDefinitions() as $fieldDefinition) {
            $value = '';

            if ($address instanceof DataObject\Concrete) {
                $getter = 'get' . ucfirst($fieldDefinition->getName());

                if (method_exists($address, $getter)) {
                    $value = $address->$getter();

                    if (method_exists($value, 'getName')) {
                        $value = $value->getName();
                    }

                    $fullAddress[] = $value;
                }
            }

            $values[$prefix . ucfirst($fieldDefinition->getName())] = $value;
        }

        if ($address->getCountry() instanceof \CoreShop\Component\Address\Model\CountryInterface) {
            $values[$prefix . 'All'] = $this->container->get(AddressFormatterInterface::class)->formatAddress(
                $address,
                false,
            );
        }

        return $values;
    }

    protected function getDetails(OrderInterface $order, ?string $locale = null): array
    {
        $jsonSale = $this->container->get('jms_serializer')->toArray($order);

        $jsonSale['id'] = $order->getId();
        $jsonSale['saleNumber'] = $order->getOrderNumber();
        $jsonSale['saleDate'] = $order->getOrderDate() ? $order->getOrderDate()->getTimestamp() : null;
        $jsonSale['currency'] = $this->getCurrency($order->getCurrency());
        $jsonSale['baseCurrency'] = $this->getCurrency($order->getBaseCurrency());
        $jsonSale['store'] = $order->getStore() instanceof StoreInterface ? $this->getStore($order->getStore()) : null;

        if (!isset($jsonSale['items'])) {
            $jsonSale['items'] = [];
        }

        $jsonSale['details'] = $this->getItemDetails($order);
        $jsonSale['summary'] = $this->getSummary($order);
        $jsonSale['mailCorrespondence'] = $this->getMailCorrespondence($order);

        $jsonSale['address'] = [
            'shipping' => $this->getDataForObject($order->getShippingAddress()),
            'billing' => $this->getDataForObject($order->getInvoiceAddress()),
        ];

        if ($order->getShippingAddress() instanceof AddressInterface &&
            $order->getShippingAddress()->getCountry() instanceof CountryInterface) {
            $jsonSale['address']['shipping']['formatted'] = $this->container->get(
                AddressFormatterInterface::class,
            )->formatAddress($order->getShippingAddress());
        } else {
            $jsonSale['address']['shipping']['formatted'] = '';
        }

        if ($order->getInvoiceAddress() instanceof AddressInterface &&
            $order->getInvoiceAddress()->getCountry() instanceof CountryInterface) {
            $jsonSale['address']['billing']['formatted'] = $this->container->get(
                AddressFormatterInterface::class,
            )->formatAddress($order->getInvoiceAddress());
        } else {
            $jsonSale['address']['billing']['formatted'] = '';
        }

        $jsonSale['priceRule'] = false;

        if ($order->getPriceRuleItems() instanceof DataObject\Fieldcollection) {
            $rules = [];

            foreach ($order->getPriceRuleItems()->getItems() as $ruleItem) {
                if ($ruleItem instanceof PriceRuleItemInterface) {
                    $rule = $ruleItem->getCartPriceRule();

                    $ruleData = [
                        'id' => -1,
                        'name' => '--',
                        'code' => empty($ruleItem->getVoucherCode()) ? null : $ruleItem->getVoucherCode(),
                        'discount' => $ruleItem->getDiscount(),
                    ];

                    if ($rule instanceof CartPriceRuleInterface) {
                        $ruleData = array_merge($ruleData, [
                            'id' => $rule->getId(),
                            'name' => $rule->getName(),
                        ]);
                    }

                    $rules[] = $ruleData;
                }
            }

            $jsonSale['priceRule'] = $rules;
        }

        $jsonSale['orderState'] = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
            'coreshop_order',
            $order->getOrderState() ?? OrderStates::STATE_NEW,
            false,
            $locale,
        );
        $jsonSale['orderPaymentState'] = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
            'coreshop_order_payment',
            $order->getPaymentState() ?? OrderPaymentStates::STATE_NEW,
            false,
            $locale,
        );
        $jsonSale['orderShippingState'] = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
            'coreshop_order_shipment',
            $order->getShippingState() ?? OrderShipmentStates::STATE_NEW,
            false,
            $locale,
        );
        $jsonSale['orderInvoiceState'] = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
            'coreshop_order_invoice',
            $order->getInvoiceState() ?? OrderInvoiceStates::STATE_NEW,
            false,
            $locale,
        );

        $availableTransitions = $this->container->get(WorkflowStateInfoManagerInterface::class)->parseTransitions(
            $order,
            'coreshop_order',
            [
            'cancel',
        ],
            false,
            $locale,
        );

        $jsonSale['availableOrderTransitions'] = $availableTransitions;
        $jsonSale['statesHistory'] = $this->getStatesHistory($order);

        $invoices = $this->getInvoices($order, $locale);

        $jsonSale['editable'] = $this->container->get(OrderEditPossibleInterface::class)->isOrderEditable($order);
        $jsonSale['invoices'] = $invoices;
        $jsonSale['payments'] = $this->getPayments($order, $locale);
        $jsonSale['shipments'] = $this->getShipments($order, $locale);
        $jsonSale['paymentCreationAllowed'] = !in_array(
            $order->getOrderState(),
            [OrderStates::STATE_CANCELLED, OrderStates::STATE_COMPLETE],
        );
        $jsonSale['invoiceCreationAllowed'] = $this->container->get('coreshop.order.invoice.processable')->isProcessable($order);
        $jsonSale['shipmentCreationAllowed'] = $this->container->get('coreshop.order.shipment.processable')->isProcessable($order);

        $event = new GenericEvent($order, $jsonSale);

        $this->container->get('event_dispatcher')->dispatch($event, Events::SALE_DETAIL_PREPARE);

        return $event->getArguments();
    }

    protected function getMailCorrespondence(OrderInterface $order): array
    {
        $list = [];

        /**
         * @var DataObject\Concrete $order
         */
        $notes = $this->container->get(NoteServiceInterface::class)->getObjectNotes($order, Notes::NOTE_EMAIL);

        foreach ($notes as $note) {
            $noteElement = [
                'date' => $note->getDate(),
                'description' => $note->getDescription(),
            ];

            foreach ($note->getData() as $key => $noteData) {
                $noteElement[$key] = $noteData['data'];
            }

            $list[] = $noteElement;
        }

        return $list;
    }

    protected function getInvoices(OrderInterface $order, ?string $locale = null): array
    {
        $invoices = $this->container->get('coreshop.repository.order_invoice')->getDocuments($order);
        $invoiceArray = [];

        foreach ($invoices as $invoice) {
            $availableTransitions = $this->container->get(WorkflowStateInfoManagerInterface::class)->parseTransitions(
                $invoice,
                'coreshop_invoice',
                [
                'complete',
                'cancel',
            ],
                false,
            );

            $data = $this->container->get('jms_serializer')->toArray($invoice);

            $data['stateInfo'] = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
                'coreshop_invoice',
                $invoice->getState(),
                false,
                $locale,
            );
            $data['transitions'] = $availableTransitions;

            $invoiceArray[] = $data;
        }

        return $invoiceArray;
    }

    protected function getShipments(OrderInterface $order, ?string $locale = null): array
    {
        $shipments = $this->container->get('coreshop.repository.order_shipment')->getDocuments($order);
        $shipmentArray = [];

        foreach ($shipments as $shipment) {
            $availableTransitions = $this->container->get(WorkflowStateInfoManagerInterface::class)->parseTransitions(
                $shipment,
                'coreshop_shipment',
                [
                'create',
                'ship',
                'cancel',
            ],
                false,
            );

            $data = $this->container->get('jms_serializer')->toArray($shipment);

            $data['stateInfo'] = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
                'coreshop_shipment',
                $shipment->getState(),
                false,
                $locale,
            );
            $data['transitions'] = $availableTransitions;

            $shipmentArray[] = $data;
        }

        return $shipmentArray;
    }

    protected function getSummary(OrderInterface $order): array
    {
        $summary = [];

        if ($order->getDiscount() !== 0) {
            $summary[] = [
                'key' => $order->getDiscount() < 0 ? 'discount' : 'surcharge',
                'value' => $order->getDiscount(),
                'convertedValue' => $order->getConvertedDiscount(),
            ];
        }

        $summary[] = [
            'key' => 'total_tax',
            'value' => $order->getTotalTax(),
            'convertedValue' => $order->getConvertedTotalTax(),
        ];
        $summary[] = [
            'key' => 'total_without_tax',
            'value' => $order->getTotal(false),
            'convertedValue' => $order->getConvertedTotal(false),
        ];
        $summary[] = [
            'key' => 'total',
            'value' => $order->getTotal(),
            'convertedValue' => $order->getConvertedTotal(),
        ];
        $summary[] = [
            'key' => 'payment_total',
            'value' => $order->getPaymentTotal(),
            'convertedValue' => $order->getConvertedPaymentTotal(),
            'precision' => 2,
            'factor' => 100,
        ];

        return $summary;
    }

    protected function getItemDetails(OrderInterface $order): array
    {
        $details = $order->getItems();
        $items = [];

        foreach ($details as $detail) {
            if ($detail instanceof OrderItemInterface) {
                $items[] = $this->prepareSaleItem($detail);
            }
        }

        return $items;
    }

    protected function prepareSaleItem(OrderItemInterface $item): array
    {
        return [
            'id' => $item->getId(),
            'productName' => $item->getName(),
            'productImage' => null,
            'quantity' => $item->getQuantity(),
            'wholesalePrice' => $item->getItemWholesalePrice(),
            'priceNet' => $item->getItemPrice(false),
            'price' => $item->getItemPrice(true),
            'total' => $item->getTotal(),
            'totalTax' => $item->getTotalTax(),
            'convertedPriceNet' => $item->getConvertedItemPrice(false),
            'convertedPrice' => $item->getConvertedItemPrice(true),
            'convertedTotal' => $item->getConvertedTotal(),
            'convertedTotalTax' => $item->getConvertedTotalTax(),
        ];
    }

    protected function getStatesHistory(OrderInterface $order): array
    {
        /**
         * @var DataObject\Concrete $order
         */
        $history = $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateHistory($order);

        $statesHistory = [];

        foreach ($history as $note) {
            $user = $note->getUser() ? User::getById($note->getUser()) : null;
            $avatar = $user ? sprintf('/admin/user/get-image?id=%d', $user->getId()) : null;
            $date = Carbon::createFromTimestamp($note->getDate());
            $statesHistory[] = [
                'icon' => 'coreshop_icon_orderstates',
                'type' => $note->getType(),
                'date' => $date->isoFormat('DD.MM.YYYY h:mm'),
                'avatar' => $avatar,
                'user' => $user ? $user->getName() : null,
                'description' => $note->getDescription(),
                'title' => $note->getDescription(),
                'data' => $note->getData(),
            ];
        }

        return $statesHistory;
    }

    protected function getPayments(OrderInterface $order, ?string $locale = null): array
    {
        $payments = $this->container->get('coreshop.repository.payment')->findForPayable($order);
        $return = [];

        foreach ($payments as $payment) {
            $details = [];
            foreach ($payment->getDetails() as $detailName => $detailValue) {
                $parsedDetailLine = $this->parsePaymentDetailLine($detailValue);

                if (null === $parsedDetailLine) {
                    continue;
                }

                $details[] = [
                    'name' => $detailName,
                    'value' => $parsedDetailLine['value'],
                    'detail' => $parsedDetailLine['detail'],
                ];
            }

            $availableTransitions = $this->container->get(WorkflowStateInfoManagerInterface::class)->parseTransitions(
                $payment,
                'coreshop_payment',
                [
                'cancel',
                'complete',
                'refund',
            ],
                false,
                $locale,
            );

            $return[] = [
                'id' => $payment->getId(),
                'datePayment' => $payment->getDatePayment() ? $payment->getDatePayment()->getTimestamp() : '',
                'provider' => $payment->getPaymentProvider()->getIdentifier(),
                'paymentNumber' => $payment->getNumber(),
                'details' => $details,
                'amount' => $payment->getTotalAmount(),
                'stateInfo' => $this->container->get(WorkflowStateInfoManagerInterface::class)->getStateInfo(
                    'coreshop_payment',
                    $payment->getState(),
                    false,
                    $locale,
                ),
                'transitions' => $availableTransitions,
            ];
        }

        return $return;
    }

    protected function getCurrency(CurrencyInterface $currency): array
    {
        return [
            'id' => $currency->getId(),
            'name' => $currency->getName(),
            'symbol' => $currency->getSymbol(),
            'isoCode' => $currency->getIsoCode(),
        ];
    }

    protected function getStore(StoreInterface $store): array
    {
        return [
            'id' => $store->getId(),
            'name' => $store->getName(),
        ];
    }

    protected function getDataForObject($data): array
    {
        if ($data instanceof DataObject\Concrete) {
            $dataLoader = new DataLoader();

            return $dataLoader->getDataForObject($data);
        }

        return [];
    }

    protected function parsePaymentDetailLine(mixed $data): ?array
    {
        $detail = null;

        if (empty($data) && $data !== 0) {
            return null;
        }

        if (is_array($data)) {
            if (count(
                array_filter($data, static function ($row) {
                    return is_array($row);
                }),
            ) > 0) {
                // we don't support sub arrays
                $detail = htmlentities(json_encode($data, \JSON_THROW_ON_ERROR));
                $data = '';
            } else {
                $data = implode(', ', $data);
            }
        }

        if (true === is_bool($data)) {
            if (true === $data) {
                $data = 'true';
            } else {
                $data = 'false';
            }
        }

        if (false === is_string($data)) {
            $data = (string) $data;
        }

        return [
            'value' => htmlentities($data),
            'detail' => $detail,
        ];
    }

    public static function getSubscribedServices(): array
    {
        /** @psalm-suppress ArgumentTypeCoercion */
        return array_merge(parent::getSubscribedServices(), [
                'event_dispatcher' => EventDispatcherInterface::class,
                new SubscribedService(
                    'CoreShop\Bundle\WorkflowBundle\StateManager\WorkflowStateInfoManagerInterface',
                    WorkflowStateInfoManagerInterface::class,
                    attributes: new Autowire(service: 'CoreShop\Bundle\WorkflowBundle\StateManager\WorkflowStateInfoManagerInterface'),
                ),
                new SubscribedService(
                    'coreshop.order.invoice.processable',
                    ProcessableInterface::class,
                    attributes: new Autowire(service: 'coreshop.order.invoice.processable'),
                ),
                new SubscribedService(
                    'coreshop.order.shipment.processable',
                    ProcessableInterface::class,
                    attributes: new Autowire(service: 'coreshop.order.shipment.processable'),
                ),
                new SubscribedService(
                    'workflows',
                    'iterable',
                    attributes: new TaggedIterator('workflow.state_machine'),
                ),
                new SubscribedService('jms_serializer', SerializerInterface::class),
                AddressFormatterInterface::class,
                NoteServiceInterface::class,
                new SubscribedService('coreshop.repository.order_invoice', OrderInvoiceRepositoryInterface::class, attributes: new Autowire(service:'coreshop.repository.order_invoice')),
                new SubscribedService('coreshop.repository.order_shipment', OrderShipmentRepositoryInterface::class, attributes: new Autowire(service:'coreshop.repository.order_shipment')),
                new SubscribedService('coreshop.repository.payment', PaymentRepositoryInterface::class, attributes: new Autowire(service:'coreshop.repository.payment')),
                HistoryLogger::class,
                OrderEditPossibleInterface::class,
            ]);
    }
}

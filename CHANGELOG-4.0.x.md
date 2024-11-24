# 4.0.12

* [PayumBundle] remove payment_state processing to confirm orders by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2743
* [Docs] Upgrade guide: Mention emergency recovery if major version got updated without updating to latest minor version first by @BlackbitDevs in https://github.com/coreshop/CoreShop/pull/2745
* [Core] allow multiple store-values by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2747
* [CoreBundle] fix quantity price rules customerGroups condition by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2750

## 4.0.11

* [Pimcore] use getCount() instead of getTotalCount() for BatchListing by @hethehe in https://github.com/coreshop/CoreShop/pull/2715
* [Store] fix cached store context by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2727
* [Twig] twig >= 3.14 is compatible again by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2719

## 4.0.10

* [PimcoreBundle] respect user language for grid filter labels (#2694) by @benwalch in https://github.com/coreshop/CoreShop/pull/2695
* [Product] fix regression of price rules for products with default unit by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2698
* [NotificationBundle] Mail Processor: Fix adding recipient twice by @benwalch in https://github.com/coreshop/CoreShop/pull/2701

## 4.0.9

* [OrderBundle] use context language for OrderState Operator by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2677
* [VariantBundle] Variant Creator by @breakone in https://github.com/coreshop/CoreShop/pull/2679

## 4.0.8

* [PaymentBundle] fix null title for payment provider by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2640
* [ProductBundle] fix missing cascade merge by @benwalch in https://github.com/coreshop/CoreShop/pull/2647
* [PaymentBundle/ShippingBundle] fix logo select form type by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2654
* [OrderBundle] use user locale for transition and state translations by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2653
* [Order] fixes for backend order creation by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2652
* [Messenger] fix serialization of failed_at by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2658
* [CoreBundle] fixes for Reports by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2659
* [Pimcore] add conflict for Pimcore 11.3.1 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2664

## 4.0.7

* [ProductBundle] fix missing cascade merge by @nehlsen in https://github.com/coreshop/CoreShop/pull/2636
* [IndexBundle] Fix JS Error due to missing global function ts() by @gadget60 in https://github.com/coreshop/CoreShop/pull/2638
* [CoreBundle] Prevent PHP error for store without currency by @BlackbitDevs in https://github.com/coreshop/CoreShop/pull/2634

## 4.0.6

* [IndexBundle] Index error if product does not have a store by @hethehe in https://github.com/coreshop/CoreShop/pull/2603
* [Index] make ObjectInterpreter compatible with "Advanced Many-To-Many Object Relation" Type by @hethehe in https://github.com/coreshop/CoreShop/pull/2604
* [Notification] make password reset notification store aware by @hethehe in https://github.com/coreshop/CoreShop/pull/2609
* [FrontendBundle] add missing subscribed services by @hethehe in https://github.com/coreshop/CoreShop/pull/2617
* [OrderBundle] Notification Rules doesn't have state/transitions in DEV mode by @hethehe in https://github.com/coreshop/CoreShop/pull/2619
* [Core] fix priorities between bundles by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2606
* [OrderBundle] fix range condition with notInRangeMessage by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2624

## 4.0.5

* [Core] Pimcore 11.1 and 11.2 compatibility and psalm update by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2584
* [NoteService] implement deadlock retry strategy by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2588

## 4.0.4

* [Docs] Improve resource bundle docs a bit by @jdreesen in https://github.com/coreshop/CoreShop/pull/2554
* [OrderBundle] register OrderDocumentPrintController in controller.yml by @breakone in https://github.com/coreshop/CoreShop/pull/2557
* [OrderBundle] cast return values for getWkHtmlToPdfBinary and getXvfb… by @breakone in https://github.com/coreshop/CoreShop/pull/2558
* [Docs] improved installation instructions by @nehlsen in https://github.com/coreshop/CoreShop/pull/2569

## 4.0.3

* [Core] Fixes in DataObject Extensions and Subscribed Services by @solverat in https://github.com/coreshop/CoreShop/pull/2528
* [MessengerBundle] make FailedMessageDetails and MessageDetails JsonSerializable by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2530

## 4.0.2

* [DataHub] only enable queries for selected entities by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2512
* add address identifier repository to subscribed services by @solverat in https://github.com/coreshop/CoreShop/pull/2518
* add guest condition by @breakone in https://github.com/coreshop/CoreShop/pull/2514
* fix customer repository service link by @solverat in https://github.com/coreshop/CoreShop/pull/2523

## 4.0.1

* [Docs] Update docusaurus by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2490
* [Resource] Update Select.php by @breakone in https://github.com/coreshop/CoreShop/pull/2489
* [Product] use coreshop.form.factory in product unit definitions extension by @solverat in https://github.com/coreshop/CoreShop/pull/2501

## 4.0.0

* add missing subscribed services by @hethehe in https://github.com/coreshop/CoreShop/pull/2439
* [Docs] update docs by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2455
* fix workflow.registry service argument by @hethehe in https://github.com/coreshop/CoreShop/pull/2457
* [StoreBundle] fix StoreCollector for backend by @codingioanniskrikos in https://github.com/coreshop/CoreShop/pull/2466
* [Core] fix o_id usages by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2473

## 4.0.0-beta.4

* [Pimcore11] remove o_ column usages by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2413
* [Pimcore11] fix return type for getChildCategories by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2414
* can not save store shop settings by @sevarozh in https://github.com/coreshop/CoreShop/pull/2415
* [Pimcore] require Pimcore 11.1 as minimum by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2423
* Fix error in the filter functionality for multiselects by @hethehe in https://github.com/coreshop/CoreShop/pull/2426

## 4.0.0-beta.3
- CoreShop 4.0.0 is the same as 3.2.0 will be, it contains all bug-fixes and feature from 3.1 and 3.2

### Bugs
 - [ResourceBundle] fix CoreShopRelation and CoreShopRelations dynamic classes setter by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2396

### Features
#### From 3.2
- [Order] Backend Order Editing by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2397, https://github.com/coreshop/CoreShop/pull/2382

## 4.0.0-beta.2
 - CoreShop 4.0.0 is the same as 3.2.0 will be, it contains all bug-fixes and feature from 3.1 and 3.2

## 4.0.0-beta.1

> CoreShop 4.0.0 is the same as 3.1.0, but with Pimcore 11 compatibility. Updating CoreShop therefore is quite easy. Since Symfony now doesn't have a full container anymore, we use Service Containers now for our Controllers. So your overwritten Controllers probably need changes.

 - Pimcore 11 Compatibility (https://github.com/coreshop/CoreShop/pull/2252, https://github.com/coreshop/CoreShop/pull/2340, https://github.com/coreshop/CoreShop/pull/2345, https://github.com/coreshop/CoreShop/pull/2352, https://github.com/coreshop/CoreShop/pull/2321, https://github.com/coreshop/CoreShop/pull/2347)
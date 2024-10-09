# 3.2.13
* [Currency/Money] implement Pimcore Grid Column by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2686
* [StorageList] make sure to remove StorageList from Session on Logout by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2684
* [InventoryBundle] add stock label renderer and hide onHand field by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2690
* [InventoryBundle] add translations for stock label #2 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2691
* [Product] fix regression of price rules for products with default unit by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2698
* [OrderBundle] fix precison/factor for Payment Total by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2700
* [Payum] req payum/payum-bundle:^2.6 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2710

# 3.2.12
* [MoneyBundle] money and moneyCurrency type should respect money_decimal_precision by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2671
* [VariantBundle] Add possibility to exclude Variants from AttributeCollector via AttributePreconditionEvent by @almshadi in https://github.com/coreshop/CoreShop/pull/2674
* [Product] don't allow Price and DiscountPrice Rule for unit prices by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2678

## 3.2.11
* [Order] fixes for backend order creation by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2652
* [Messenger] fix serialization of failed_at by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2658

## 3.2.10
* [ProductBundle] fix missing cascade merge by @benwalch in https://github.com/coreshop/CoreShop/pull/2647

## 3.2.9
* [PaymentBundle] fix null title for payment provider by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2640
* [Pimcore] CoreShop 3 compatibility only with Pimcore 10.6 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2644

## 3.2.8
* [CoreBundle] fix PaymentWorkflow Listener to trigger state transition conditions by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2601
* [CoreBundle] fix CartTextProcessor priority and CartManagers setParent for cart-item by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2602
* [MessengerBundle] add permission and check for permissions by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2611
* [Composer] conflict twig/twig: ^3.9.0 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2612
* [Workflows] update to latest versions by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2613
* [PaymentProvider] fix payment provider rule action and add payment provider rule condition by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2614
* [Core] reimplement existing data check in ProductQuantityPriceRulesCloner by @solverat in https://github.com/coreshop/CoreShop/pull/2620
* [Documentation] Contribution/setting up dev enviornment by @TanaseTeofil in https://github.com/coreshop/CoreShop/pull/2576
* [ResourceBundle] Fix EntityMerger and cascade-merging by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2622
* [IndexBundle] check migration if column already exists by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2627

## 3.2.7
* Fix store mail and store order mail collection entry type by @kkarkus in https://github.com/coreshop/CoreShop/pull/2586
* [NoteService] implement deadlock retry strategy by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2588
* always set default unit quantity in gift product action by @solverat in https://github.com/coreshop/CoreShop/pull/2590
* [CoreBundle] fix PaymentWorkflow Listener to trigger state transition conditions by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2601
* [CoreBundle] fix CartTextProcessor priority and CartManagers setParent for cart-item by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2602

## 3.2.6
* [Tests] add test for stock tracked products in checkout by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2560
* [Tests] test only latest pimcore with highest deps for 3.2 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2559
* Increase MessengerBundle Receivers combobox width by @NiklasBr in https://github.com/coreshop/CoreShop/pull/2567
* Updated CachedStoreContext.php by @kamil-karkus in https://github.com/coreshop/CoreShop/pull/2565
* [Core] fix price calculation with immutables and adjustments by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2573

## 3.2.5
* [Migration] [Migration] fix Staticroute Migration for Pimcore 10 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2550

## 3.2.4
* [CoreBundle] fix priority of coreshop_payment_token route by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2542
* [Frontend] create order-token if not yet exists by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2543
* [ProductBundle] default return empty array instead of null in preGetData by @breakone in https://github.com/coreshop/CoreShop/pull/2544

## 3.2.3
* [ProductBundle] fix ClearCachedPriceRulesListener - remove service definition

## 3.2.2 
* [CartManager] create unique key for cart items by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2510
* [Core] Use order tokens in payment capture by @yariksheptykin in https://github.com/coreshop/CoreShop/pull/2515
* [Core] add caching for recursive variant checking by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2520
* use null coalescing operator against maxUsagePerUser by @sovlerat in https://github.com/coreshop/CoreShop/pull/2524

## 3.2.1
* [ClassDefinitionPatch] allow update of field-definitions instead of replace by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2494
* [Product] assert range sort for qpr by @solverat in https://github.com/coreshop/CoreShop/pull/2498
* [OrderEdit] allow 0 quantity by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2499
* [ClassDefinitionPatch] Class patches array by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2496

## 3.2.0

* [Order] introduce feature to allow editing confirmed orders in backend by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2382
* [Order] Backend Order Editing by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2397
* [StorageListBundle] make restore cart after checkout configurable by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2428
* [OrderEdit] don't allow cancelled orders to be editable by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2431
* [Voucher] restrict voucher usage per customer by @Philip-Neusta in https://github.com/coreshop/CoreShop/pull/2451
* [CoreBundle] introduce Product Price Rule that is not combinable with Cart Price Voucher Rule by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2458
* [CoreBundle] fix migration to add immutable field to order by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2465

## 3.2.0-beta.1

* [StorageListBundle] make restore cart after checkout configurable by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2428
* [OrderEdit] don't allow cancelled orders to be editable by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2431

## 3.2.0-beta.1

### Features

- [Order] Backend Order Editing by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2397, https://github.com/coreshop/CoreShop/pull/2382


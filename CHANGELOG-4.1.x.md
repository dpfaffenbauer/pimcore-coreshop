## 4.1.0
* [Registry] require registry 4.1 in all bundles by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2748
* Update CartController - remove Argument Injection by @steinerCors in https://github.com/coreshop/CoreShop/pull/2741
* [Frontend] introduce template installer and better define best-practice by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2739

## 4.1.0-RC2

> **Important** The FrontendBundle is now disabled by default. We added a migration to enable it
> Please check if it actually is enabled in the bundles.php file
> If you don't need it, feel free to disable it.
* [ResourceBundle] check also for empty "pimcore_class_name" by @breakone in https://github.com/coreshop/CoreShop/pull/2716
* [CoreBundle] implement name functions and add migration for order-name and wishlist-name by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2717
* [Pimcore] introduce the Printable by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2720
* [Printable] further improvements to new printable feature by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2724

## 4.1.0-RC1 

> **Important**: Dependency to dachcom-digital/emailizr has been removed due to licensing issues with GPL and CCL. If
> you are using the emailzr extension, please install it manually again with
> composer require dachcom-digital/emailizr

* [Attributes] allow PHP8 Attributes for tagging services by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2533
* [TestBundle] introduce a standalone test-bundle to make testing with Pimcore and Behat easier by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2078
* [Core] add tax-rule per store by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2341
* [ResourceBundle] auto registration of pimcore models by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2536
* [Payment] allow encryption of gatway configs by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2538
* [Order] allow passing custom-attributes from price rules to order-item by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2555
* [StorageList] Multi Cart Selection by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2631
* [JMS] allow v5 by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2493
* [OrderBundle] re-factor PDF rendering to use Pimcore Web2Print by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2668
* [Emailzr] remove extension by @dpfaffenbauer in https://github.com/coreshop/CoreShop/pull/2703
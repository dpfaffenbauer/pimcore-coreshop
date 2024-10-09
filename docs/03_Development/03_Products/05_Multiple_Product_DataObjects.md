# Create a new Product Type

CoreShop allows you to create a new custom Product Type. The most single interface implementation that can be added to
the cart
is the `CoreShop\Component\Order\Model\PurchasableInterface`. You therefore have to at least implement this interface if
you want to add a new Product Type and allow it to be added to the cart.

If you need Product Price Rules, Product Specific Price Rules and Quantity Price Rules, you have to go for
the `CoreShop\Component\Core\Model\ProductInterface`.
In that case, it is easier to just copy the `CoreShopProduct` Class Definition and add it as a new Class.

## Registering your Product Type

In Order for CoreShop to know that there is a new `Purchasable`, you have to register your class. The easiest way to do
this is, to add this config:

```yaml
core_shop_resource:
  pimcore:
    app.my_product:
      classes:
        model: Pimcore\Model\DataObject\MyProduct
        interface: CoreShop\Component\Core\Model\ProductInterface
```

Or if it's just a `Purchasable`:

```yaml
core_shop_resource:
  pimcore:
    app.my_product:
      classes:
        model: Pimcore\Model\DataObject\MyProduct
        interface: CoreShop\Component\Order\Model\PurchasableInterface
```

CoreShop will then create separate Services for you, the mains one are the Factory and the
Repository (`app.repository.my_product`, `app.factory.my_product`).
You don't need to use them in your Project, but they are quite important internally for CoreShop.

### Alternative using Attributes
Since CoreShop 4.1.0, it is also possible to use PHP Attributes to register new Product Types.
You can do this by adding the following Attribute to your Product Class:

```php
<?php

declare(strict_types=1);

namespace App\Model;

use CoreShop\Bundle\ResourceBundle\Attribute\AsPimcoreModel;
use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreModel;

#[AsPimcoreModel(
    pimcoreModel: 'Pimcore\Model\DataObject\MyProduct',
    type: 'object',
    interface: PurchasableInterface::class
)]
class MyProduct extends AbstractPimcoreModel implements PurchasableInterface
{
    
}
```

For this to work, you have to make sure that your `core_shop_resource` Mapping Path is set.
Per default, it points to `%kernel.project_dir%/src/Model`.

You can change this configuration by adding the following to your Symfony Config:

```yaml
core_shop_resource:
  mapping:
    path: '%kernel.project_dir%/src/Model'
```

## Price Calculators

Since you added a new Product Class, you also need Price Calculators for it. CoreShop has a few Price Calculators
already, but you can add your own.

> If you just added a Purchasable, you have to create a new Price Calculator.

To create a new Price Calculator, you need to implement the
interfaces `CoreShop\Component\Order\Calculator\PurchasablePriceCalculatorInterface`
and `CoreShop\Component\Order\Calculator\PurchasableRetailPriceCalculatorInterface`.

For how Pricing works in detail, see this: [Pricing](./02_Price_Calculation.md)

```php
<?php

declare(strict_types=1);

namespace App\CoreShop;

use CoreShop\Component\Order\Calculator\PurchasablePriceCalculatorInterface;
use CoreShop\Component\Order\Calculator\PurchasableRetailPriceCalculatorInterface;
use CoreShop\Component\Order\Exception\NoPurchasablePriceFoundException;
use CoreShop\Component\Order\Exception\NoPurchasableRetailPriceFoundException;
use CoreShop\Component\Order\Model\PurchasableInterface;

class MyProductPriceCalculator implements PurchasablePriceCalculatorInterface, PurchasableRetailPriceCalculatorInterface
{
    public function getPrice(PurchasableInterface $purchasable, array $context, bool $includingDiscounts = false): int
    {
        return $this->getRetailPrice($purchasable, $context);
    }

    public function getRetailPrice(PurchasableInterface $purchasable, array $context): int
    {
        if (!$purchasable instanceof \Pimcore\Model\DataObject\MyProduct) {
            throw new NoPurchasableRetailPriceFoundException(__CLASS__);
        }

        return 100;
    }
}
```

You then also need to register your new Calculator as a Service:

```yaml
    App\CoreShop\MyProductPriceCalculator:
        tags:
            - { name: coreshop.order.purchasable.price_calculator, type: my_product }
            - { name: coreshop.order.purchasable.retail_price_calculator, type: my_product }
```
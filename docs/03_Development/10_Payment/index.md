# Payment

CoreShop features a highly flexible payment management system, supporting a wide range of gateways (payment providers).
It utilizes [Payum](https://github.com/payum/payum), a payment abstraction library, to handle various aspects of payment
processing, including capturing, refunding, and recurring payments.

## Available Payment Gateways for CoreShop

CoreShop supports several payment gateways, each with its own set of features and capabilities:

| Name            | State  | Link                                                         | Support                                                                                                      | Offsite | Supports Server-Notification | Supports Refund |
|-----------------|--------|--------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|---------|------------------------------|-----------------|
| **Heidelpay**   | stable | [Github](https://github.com/coreshop/PayumHeidelpayBundle)   | PayPal, Klarna Sofort, Credit Card                                                                           | No      | Yes                          | No              |
| **SaferPay**    | stable | [Github](https://github.com/coreshop/PayumSaferpayBundle)    | [Supported Payment Methods](https://saferpay.github.io/sndbx/index.html#paymentmethods)                      | Yes     | Yes                          | Partially       |
| **PostFinance** | stable | [Github](https://github.com/coreshop/PayumPostFinanceBundle) | PostFinance Card, PostFinance E-Finance, Visa, MasterCard, Diners Club, American Express, JCB, PayPal, TWINT | Yes     | Yes                          | No              |
| **PowerPay**    | dev    | [Github](https://github.com/coreshop/PayumPowerpayBundle)    | invoice, automatic credit check                                                                              | No      | No (not required)            | No              |
| **CuraBill**    | dev    | [Github](https://github.com/coreshop/PayumCurabillBundle)    | invoice, instalments via iframe                                                                              | No      | No (not required)            | No              |

## Payment Model

Each payment in CoreShop, whether successful or failed, is represented by a payment model. This model contains essential
information and a reference to the relevant order.

## Creating a Payment Programmatically

To create a new payment method programmatically, use a factory and assign a unique code:

```php
$payment = $this->container->get('coreshop.factory.payment')->createNew();

$payment->setOrder($order);
$payment->setCurrencyCode('EUR');

$this->container->get('coreshop.repository.payment')->add($payment);
```

## Additional Resources

For more information on payment integration and management in CoreShop:

- **[Payment Provider](./01_Payment_Provider.md)**
- **[Encrypt Payment Gateway Configuration](./02_Encrypt_Config.md)**
- **[Payum Providers](./03_Payum_Providers.md)**

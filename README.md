**CoreShop - Pimcore eCommerce**

![Static Tests (Lint, Stan)](https://github.com/coreshop/CoreShop/actions/workflows/static.yml/badge.svg)
![Behat UI Tests](https://github.com/coreshop/CoreShop/workflows/Behat%20UI/badge.svg)
![Behat Tests](https://github.com/coreshop/CoreShop/workflows/Behat/badge.svg)
[![Software License](https://img.shields.io/badge/license-GPLv3-brightgreen.svg?style=flat)](LICENSE.md)
[![Latest Pre-Release](https://img.shields.io/packagist/vpre/coreshop/core-shop.svg)](https://www.packagist.org/packages/coreshop/core-shop)

[CoreShop](https://www.coreshop.com) is a eCommerce Platform for [Pimcore](http://www.pimcore.org).

![CoreShop Interface](docs/img/screenshot5.png)

# Requirements 
 - Pimcore `^10.5`

# Installation
 - Allow dev version to be installed:
   ```
   composer config "minimum-stability" "dev"
   composer config "prefer-stable" "true"
   ```
 - Install with composer 
   ```
   composer require coreshop/core-shop:^3.0
   ```
 - Run enable Bundle command
   ```
   php bin/console pimcore:bundle:enable CoreShopCoreBundle
   ```
 - Run Install Command
   ```
   php bin/console coreshop:install
   ```
 - Optional: Install Demo Data 
   ```
   php bin/console coreshop:install:demo
   ```
## Messenger
CoreShop also uses Symfony Messenger for async tasks like sending E-Mails or Processing DataObjects for the Index. Please run these 2 transports to process the data
```
bin/console messenger:consume coreshop_notification coreshop_index --time-limit=300
```

# Further Information
 - [Website](https://www.coreshop.com)
 - [Documentation](https://docs.coreshop.com/latest)
 - [Pimcore Forum](https://talk.pimcore.org)

# Demo
You can see a running demo here [CoreShop 3.x Demo](https://demo3.coreshop.org)

**Backend Credentials**

```
Admin: https://demo3.coreshop.org/admin

Username: admin
Password: coreshop
```

## Running Tests Locally

Follow the instructions in the [CONTRIBUTING.md](./CONTRIBUTING.md) to set up your local development environment
and run the tests.


## Copyright and license 
Copyright: [CoreShop GmbH](https://www.coreshop.com)
For licensing details please visit [LICENSE.md](LICENSE.md) 

## Screenshots
![CoreShop Interface](docs/img/screenshot5-2.png)
![CoreShop Interface](docs/img/screenshot5-3.png)

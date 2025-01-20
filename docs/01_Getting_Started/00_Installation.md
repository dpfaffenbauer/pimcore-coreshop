# Installation

To install CoreShop, ensure you have a running instance of Pimcore on your system. Follow these steps to set up
CoreShop:

## Initial Setup

1. Install with composer: `composer require coreshop/core-shop ^4.0`
2. Enable the bundle in `config/bundles.php` and the `CoreShopCoreBundle` to the list of Bundles to load:
    ```php
    <?php
    
    return [
       ...
        CoreShop\Bundle\CoreBundle\CoreShopCoreBundle::class => ['all' => true],
        CoreShop\Bundle\FrontendBundle\CoreShopFrontendBundle::class => ['all' => true],
    ];
    ```
3. To configure the CoreShop Password Hasher, create or update the `config/packages/pimcore.yaml` and add:
      ```yaml
      pimcore:
          security:
              password_hasher_factories:
                  Pimcore\Model\DataObject\CoreShopUser: coreshop.security.user.password_hasher_factories
      ```
4. Update `config/packages/security.yaml` to allow access to the CoreShop Backend.
    - Add the CoreShop Frontend parameter at the very top of your `security.yaml` (before `security`):
      ```yaml
      parameters:
          coreshop.security.frontend_regex: "^/(?!admin)[^/]*"

      security:
          ...
      ```
    - Add the Authentication Provider. Find your existing `providers` entry and add the `coreshop_user` entry after the other(s):
      ```yaml
       providers:
         ...
         coreshop_user:
             id: CoreShop\Bundle\CoreBundle\Security\ObjectUserProvider
      ```
    - Add the Firewall Config. Find your existing `firewalls` entry and add the `coreshop_frontend` entry after the other entries:
      ```yaml
       firewalls:
         coreshop_frontend:
             provider: coreshop_user
             pattern: '%coreshop.security.frontend_regex%'
             context: shop
             form_login:
                 login_path: coreshop_login
                 check_path: coreshop_login_check
                 provider: coreshop_user
                 failure_path: coreshop_login
                 default_target_path: coreshop_index
                 use_forward: false
                 use_referer: true
             remember_me:
                 secret: "%secret%"
                 name: APP_CORESHOP_REMEMBER_ME
                 lifetime: 31536000
                 remember_me_parameter: _remember_me
             logout:
                 path: coreshop_logout
                 target: coreshop_login
                 invalidate_session: false
      ```
    - Add Access Control. Find your existing `access_control` entry and add the following lines after the existing ones:
      ```yaml
       access_control:
         - { path: "%coreshop.security.frontend_regex%/_partial", role: IS_AUTHENTICATED_ANONYMOUSLY, ips: [127.0.0.1, ::1] }
         - { path: "%coreshop.security.frontend_regex%/_partial", role: ROLE_NO_ACCESS }
      ```
5. Run Install Command `php bin/console coreshop:install`
6. Optional: Install Demo Data `php bin/console coreshop:install:demo`

## Messenger

CoreShop also uses Symfony Messenger for async tasks like sending E-Mails or Processing DataObjects for the Index.
Please run these 2 transports to process the data

```yaml
bin/console messenger:consume coreshop_notification coreshop_index coreshop_variant --time-limit=300
```

## Payment

CoreShop uses Payum for Payment. Checkout Payum's Documentation on how to add payment providers.

Payment providers are implemented as Pimcore Plugin. They can be installed using composer. Here you can find all
available payment modules via composer

[Payum Documentation](https://github.com/Payum/Payum/blob/master/docs/index.md#symfony-payum-bundle)

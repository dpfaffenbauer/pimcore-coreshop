# Best Practices for Frontend in CoreShop

We learned a lot over the years and want to share our best practices with you. This guide will help you to get the most 
out of CoreShop and to avoid common pitfalls.

## Server Side Rendering
If you do PHP Server Side Rendering with Twig, you should enable the Frontend Bundle in bundles.php:

```php
// config/bundles.php
return [
    // ...
    CoreShop\Bundle\FrontendBundle\CoreShopFrontendBundle::class => ['all' => true],
];
```

### Templates
Symfony allows to override Bundle templates by placing them in the `templates` directory. This is something we don't recommend!
We, at CoreShop, sometimes change Templates, add templates, or rename them. Sometimes on accident, sometimes on purpose.

To not run into any issues with CoreShop Demo Files to be loaded, we recommend to copy the Templates from the Demo Frontend.
There is also a new command for that:

```bash
php bin/console coreshop:frontend:install
```

This will copy all the templates from CoreShop into `coreshop` and it also replaces all the Bundle Prefixes. That way, you
can be sure that you are using the correct templates.

This command also creates a configuration to change the `TemplateConfigurator` to use your app template paths and not the
FrontendBundle paths.

## Headless
If you are going headless, you can simply not enable the Frontend Bundle and do whatever need for your Headless API.
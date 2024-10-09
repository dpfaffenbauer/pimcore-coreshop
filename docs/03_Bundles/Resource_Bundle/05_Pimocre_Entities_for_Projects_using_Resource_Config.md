# Pimcore for Projects using Resource Config

## Step 1: Add a New Pimcore Class in Pimcore

1. Create a new class in Pimcore.
2. Add a Parent Class to your Pimcore Entity.

## Step 2: Create Parent Class

### PimcoreEntity

Create PimcoreEntity.php in the App/Model directory.

```php
<?php
// App/Model/PimcoreEntity.php

abstract class PimcoreEntity extends AbstractPimcoreModel implements PimcoreModelInterface 
{
    
}
```

## Step 3: Create the Resource Configuration

### config/config.yaml

```yaml
core_shop_resource:
  pimcore:
    app.pimcore_entity:
      classes:
        model: Pimcore\Model\DataObject\PimcoreEntity
        interface: CoreShop\Component\Resource\Model\ResourceInterface
```

## Step 4: Use Your Pimcore Entity

You can either use Pimcore Listing Classes or the automatically generated Factory/Repository Classes.

### Using Pimcore Listing Classes

```php
$list = new Pimcore\Model\Object\PimcoreEntity\Listing();
```

### Using Factory/Repository Classes

```php
$pimcoreEntityObject = $container->get('app.repository.pimcore_entity')->findBy($id);

$list = $container->get('app.repository.pimcore_entity')->getList();
```

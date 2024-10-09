# Encrypt Payment Gatway Configuration

1. Create a new file in the root of your project and name it `encrypt.php`.

```php
<?php
use Defuse\Crypto\Key;
require_once 'vendor/autoload.php';
var_dump(Key::createNewRandomKey()->saveToAsciiSafeString());
```

2. Store your key in a safe place and add it to your `.env` file.

```env
CORESHOP_PAYUM_ENCRYPT_KEY="YOUR KEY"
```

3. Add the following code to your `config/config.yaml` file.

```yaml
payum:
  dynamic_gateways:
    encryption:
      defuse_secret_key: "%env(CORESHOP_PAYUM_ENCRYPT_KEY)%"
```

4. Existing payment gateway configs will be automatically encrypted when updated. New payment gateway configs will be
   encrypted by default.
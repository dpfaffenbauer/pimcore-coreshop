<?php

declare(strict_types=1);

/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

namespace CoreShop\Bundle\PayumBundle;

use Http\Adapter\Guzzle7\Client;
use Payum\Bundle\PayumBundle\ContainerAwareCoreGatewayFactory;
use Payum\Core\Bridge\Spl\ArrayObject;

class CoreGatewayFactory extends ContainerAwareCoreGatewayFactory
{
    public function createConfig(array $config = []): array
    {
        return parent::createConfig([
            'httplug.client' => function (ArrayObject $config) {
                return new Client();
            },
        ]);
    }
}

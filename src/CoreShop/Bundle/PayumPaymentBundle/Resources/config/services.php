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

namespace Symfony\Component\DependencyInjection\Loader\Configurator;

use CoreShop\Bundle\PayumPaymentBundle\Form\Extension\CryptedGatewayConfigTypeExtension;
use CoreShop\Bundle\PayumPaymentBundle\Form\Type\GatewayConfigType;

/**
 * We got this as a separate file since YAML does not allow nullOnInvalid
 */
return function (ContainerConfigurator $container): void {
    $services = $container->services();

    $services->set(CryptedGatewayConfigTypeExtension::class)
        ->args([service('payum.dynamic_gateways.cypher')->nullOnInvalid()])
        ->tag('form.type_extension', ['extended_type' => GatewayConfigType::class])
    ;
};

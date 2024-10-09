<?php

declare(strict_types=1);

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
        ->tag('form.type_extension', ['extended_type' => GatewayConfigType::class]);
};
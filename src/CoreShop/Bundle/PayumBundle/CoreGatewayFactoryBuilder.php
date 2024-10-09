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

use Payum\Bundle\PayumBundle\ContainerAwareCoreGatewayFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;

class CoreGatewayFactoryBuilder extends \Payum\Bundle\PayumBundle\Builder\CoreGatewayFactoryBuilder
{
    private ContainerInterface $container;

    public function __construct(
        ContainerInterface $container,
    ) {
        parent::__construct($container);

        $this->container = $container;
    }

    public function build(array $defaultConfig): ContainerAwareCoreGatewayFactory
    {
        return new ContainerAwareCoreGatewayFactory($this->container, $defaultConfig);
    }
}

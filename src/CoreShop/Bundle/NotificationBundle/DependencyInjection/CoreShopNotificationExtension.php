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

namespace CoreShop\Bundle\NotificationBundle\DependencyInjection;

use CoreShop\Bundle\NotificationBundle\Attribute\AsNotificationRuleActionProcessor;
use CoreShop\Bundle\NotificationBundle\Attribute\AsNotificationRuleConditionChecker;
use CoreShop\Bundle\NotificationBundle\DependencyInjection\Compiler\NotificationRuleActionPass;
use CoreShop\Bundle\NotificationBundle\DependencyInjection\Compiler\NotificationRuleConditionPass;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Component\Notification\Rule\Action\NotificationRuleProcessorInterface;
use CoreShop\Component\Notification\Rule\Condition\NotificationConditionCheckerInterface;
use CoreShop\Component\Registry\Autoconfiguration;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

final class CoreShopNotificationExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $this->registerResources('coreshop', CoreShopResourceBundle::DRIVER_DOCTRINE_ORM, $configs['resources'], $container);

        if (array_key_exists('pimcore_admin', $configs)) {
            $this->registerPimcoreResources('coreshop', $configs['pimcore_admin'], $container);
        }

        $loader->load('services.yml');

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            NotificationRuleProcessorInterface::class,
            NotificationRuleActionPass::NOTIFICATION_ACTION_TAG,
            AsNotificationRuleActionProcessor::class,
            true,
        );

        Autoconfiguration::registerForAutoConfiguration(
            $container,
            NotificationConditionCheckerInterface::class,
            NotificationRuleConditionPass::NOTIFICATION_CONDITION_TAG,
            AsNotificationRuleConditionChecker::class,
            true,
        );
    }
}

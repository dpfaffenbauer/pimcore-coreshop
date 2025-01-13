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

namespace CoreShop\Bundle\StorageListBundle\DependencyInjection;

use CoreShop\Bundle\ResourceBundle\DependencyInjection\Extension\AbstractModelExtension;
use CoreShop\Bundle\StorageListBundle\Core\EventListener\SessionStoreStorageListLogoutSubscriber;
use CoreShop\Bundle\StorageListBundle\Core\EventListener\SessionStoreStorageListSubscriber;
use CoreShop\Bundle\StorageListBundle\Core\EventListener\StorageListBlamerListener;
use CoreShop\Bundle\StorageListBundle\EventListener\CacheListener;
use CoreShop\Bundle\StorageListBundle\EventListener\SessionSubscriber;
use CoreShop\Component\Core\Context\ShopperContextInterface;
use CoreShop\Component\Customer\Context\CustomerContextInterface;
use CoreShop\Component\Customer\Model\CustomerAwareInterface;
use CoreShop\Component\StorageList\Context\CompositeStorageListContext;
use CoreShop\Component\StorageList\Context\SessionBasedListContext;
use CoreShop\Component\StorageList\Context\StorageListContextInterface;
use CoreShop\Component\StorageList\Context\StorageListFactoryContext;
use CoreShop\Component\StorageList\Core\Context\CustomerAndStoreBasedStorageListContext;
use CoreShop\Component\StorageList\Core\Context\SessionAndStoreBasedStorageListContext;
use CoreShop\Component\StorageList\Core\Context\StoreBasedStorageListContext;
use CoreShop\Component\StorageList\Core\Provider\CoreContextProvider;
use CoreShop\Component\StorageList\Core\Storage\SessionStorageListStorage;
use CoreShop\Component\StorageList\Expiration\StorageListExpiration;
use CoreShop\Component\StorageList\Maintenance\ExpireTask;
use CoreShop\Component\StorageList\Provider\ContextProvider;
use CoreShop\Component\StorageList\Storage\SimpleStorageListStorage;
use CoreShop\Component\StorageList\StorageListsManager;
use CoreShop\Component\Store\Context\StoreContextInterface;
use CoreShop\Component\Store\Model\StoreAwareInterface;
use Pimcore\Http\Request\Resolver\PimcoreContextResolver;
use Pimcore\Http\RequestHelper;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Alias;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\Security\Http\Event\LogoutEvent;

final class CoreShopStorageListExtension extends AbstractModelExtension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configs = $this->processConfiguration($this->getConfiguration([], $container), $configs);
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));

        $loader->load('services.yml');

        $manager = $container->findDefinition(StorageListsManager::class);

        $tags = [];

        foreach ($configs['list'] as $name => $list) {
            $isDefaultContextInterface = $list['context']['interface'] === StorageListContextInterface::class;
            $isDefaultContextComposite = $list['context']['composite'] === CompositeStorageListContext::class;

            $contextCompositeServiceName = $isDefaultContextComposite ? 'coreshop.context.storage_list.' . $name : $list['context']['composite'];

            if (!interface_exists($list['context']['interface'])) {
                throw new \RuntimeException(
                    sprintf(
                        'Interface %s for Storage List Context "%s" does not exist',
                        $list['context']['interface'],
                        $name,
                    ),
                );
            }

            if (!$container->hasDefinition($contextCompositeServiceName)) {
                $compositeService = new Definition($list['context']['composite']);
                $compositeService->setPublic(true);

                $container->setDefinition($contextCompositeServiceName, $compositeService);
            }

            if (!$isDefaultContextInterface && !$container->hasDefinition($list['context']['interface'])) {
                $interfaceAlias = new Alias($contextCompositeServiceName, true);

                $container->setAlias($list['context']['interface'], $interfaceAlias);
            }

            if (!$isDefaultContextInterface) {
                $container
                    ->registerForAutoconfiguration($list['context']['interface'])
                    ->addTag($list['context']['tag'])
                ;
            }

            $factoryContextDefinition = new Definition(StorageListFactoryContext::class);
            $factoryContextDefinition->setArgument('$storageListFactory', new Reference($list['resource']['factory']));
            $factoryContextDefinition->addTag($list['context']['tag'], ['priority' => -999]);

            $container->setDefinition('coreshop.storage_list.context.factory.' . $name, $factoryContextDefinition);

            if ($list['session']['enabled']) {
                $sessionSubscriber = new Definition(SessionSubscriber::class, [
                    new Reference(PimcoreContextResolver::class),
                    new Reference($contextCompositeServiceName),
                    $list['session']['key'],
                ]);
                $sessionSubscriber->addTag('kernel.event_subscriber');

                $container->setDefinition('coreshop.storage_list.session_subscriber.' . $name, $sessionSubscriber);
            }

            if ($list['disable_caching']) {
                $cacheSubscriber = new Definition(CacheListener::class, [
                    new Reference($list['resource']['repository']),
                    new Reference($list['resource']['item_repository']),
                ]);

                $cacheSubscriber->addTag('kernel.event_subscriber');
                $container->setDefinition('coreshop.storage_list.cache_subscriber.' . $name, $cacheSubscriber);
            }

            if ($list['controller']['enabled']) {
                $class = $list['controller']['class'];

                if ($container->has($class)) {
                    $controllerDefinition = $container->getDefinition($class);
                } else {
                    $controllerDefinition = new Definition($class);
                }

                $controllerDefinition->setArgument('$identifier', $name);
                $controllerDefinition->setArgument('$formFactory', new Reference('form.factory'));
                $controllerDefinition->setArgument('$repository', new Reference($list['resource']['repository']));
                $controllerDefinition->setArgument('$productRepository', new Reference($list['resource']['product_repository']));
                $controllerDefinition->setArgument('$itemRepository', new Reference($list['resource']['item_repository']));
                $controllerDefinition->setArgument('$context', new Reference($contextCompositeServiceName));
                $controllerDefinition->setArgument('$storageListFactory', new Reference($list['resource']['factory']));
                $controllerDefinition->setArgument('$storageListItemFactory', new Reference($list['resource']['item_factory']));
                $controllerDefinition->setArgument('$addToStorageListFactory', new Reference($list['resource']['add_to_list_factory']));
                $controllerDefinition->setArgument('$modifier', new Reference($list['services']['modifier']));
                $controllerDefinition->setArgument('$manager', new Reference($list['services']['manager']));
                $controllerDefinition->setArgument('$addToStorageListForm', $list['form']['add_type']);
                $controllerDefinition->setArgument('$form', $list['form']['type']);
                $controllerDefinition->setArgument('$summaryRoute', $list['routes']['summary']);
                $controllerDefinition->setArgument('$indexRoute', $list['routes']['index']);
                $controllerDefinition->setArgument('$templateSummary', $list['templates']['summary']);
                $controllerDefinition->setArgument('$templateAddToList', $list['templates']['add_to_cart']);
                $controllerDefinition->setArgument('$translator', new Reference('translator'));
                $controllerDefinition->addTag('controller.service_arguments');
                $controllerDefinition->addTag('container.service_subscriber');

                $container->setDefinition('coreshop.storage_list.controller.' . $name, $controllerDefinition);
            }

            if ($list['multi_list']['enabled']) {
                $container->setParameter(
                    'coreshop.storage_list.multi_list.' . $name,
                    $list['multi_list']['enabled'],
                );

                if ($list['multi_list']['controller']['enabled']) {
                    $class = $list['multi_list']['controller']['class'];
                    if ($container->has($class)) {
                        $controllerDefinition = $container->getDefinition($class);
                    } else {
                        $controllerDefinition = new Definition($class);
                    }

                    $controllerDefinition->setArgument('$identifier', $name);
                    $controllerDefinition->setArgument('$context', new Reference($contextCompositeServiceName));
                    $controllerDefinition->setArgument('$formFactory', new Reference('form.factory'));
                    $controllerDefinition->setArgument('$repository', new Reference($list['resource']['repository']));
                    $controllerDefinition->setArgument('$repository', new Reference($list['resource']['repository']));
                    $controllerDefinition->setArgument(
                        '$storageListFactory',
                        new Reference($list['resource']['factory']),
                    );
                    $controllerDefinition->setArgument(
                        '$contextProvider',
                        new Reference('coreshop.storage_list.context_provider.' . $name),
                    );
                    $controllerDefinition->setArgument('$manager', new Reference($list['services']['manager']));
                    $controllerDefinition->setArgument('$translator', new Reference('translator'));
                    $controllerDefinition->setArgument('$storage', new Reference('coreshop.storage_list.storage.' . $name));
                    $controllerDefinition->setArgument('$listResolver', new Reference($list['services']['list_resolver']));
                    $controllerDefinition->setArgument('$listFormType', $list['multi_list']['form']['class']);
                    $controllerDefinition->setArgument('$templateCreateNewList', $list['multi_list']['templates']['create_new_storage_list']);
                    $controllerDefinition->setArgument('$templateListStorageLists', $list['multi_list']['templates']['list_storage_list']);

                    $controllerDefinition->addTag('controller.service_arguments');
                    $controllerDefinition->addTag('container.service_subscriber');

                    $container->setDefinition(
                        'coreshop.storage_list.controller_multi_list.' . $name,
                        $controllerDefinition,
                    );
                }
            }

            $manager->addMethodCall('addList', [
                $name,
                new Reference($list['services']['manager']),
                new Reference($contextCompositeServiceName),
                new Reference($list['services']['modifier']),
            ]);

            $contextsRegistered = false;

            $coreContextProviderDefinition = new Definition(ContextProvider::class);
            $container->setDefinition('coreshop.storage_list.context_provider.' . $name, $coreContextProviderDefinition);

            $simpleStorage = new Definition(SimpleStorageListStorage::class);
            $container->setDefinition('coreshop.storage_list.storage.' . $name, $simpleStorage);

            if (interface_exists(CustomerAwareInterface::class) && interface_exists(StoreAwareInterface::class)) {
                $implements = \class_implements($list['resource']['interface']);

                if (isset($implements[StoreAwareInterface::class], $implements[CustomerAwareInterface::class])) {
                    $contextsRegistered = true;

                    $coreContextProviderDefinition = new Definition(CoreContextProvider::class);
                    $coreContextProviderDefinition->setArgument('$shopperContext', new Reference(ShopperContextInterface::class));

                    $container->setDefinition('coreshop.storage_list.context_provider.' . $name, $coreContextProviderDefinition);

                    $customerAndStoreBasedContextDefinition = new Definition(CustomerAndStoreBasedStorageListContext::class);
                    $customerAndStoreBasedContextDefinition->setArgument('$customerContext', new Reference(CustomerContextInterface::class));
                    $customerAndStoreBasedContextDefinition->setArgument('$storeContext', new Reference(StoreContextInterface::class));
                    $customerAndStoreBasedContextDefinition->setArgument('$repository', new Reference($list['resource']['repository']));
                    $customerAndStoreBasedContextDefinition->setArgument('$requestHelper', new Reference(RequestHelper::class));
                    $customerAndStoreBasedContextDefinition->setArgument('$restoreCustomerStorageListOnlyOnLogin', $list['context']['restore_customer_list_only_on_login']);
                    $customerAndStoreBasedContextDefinition->addTag($list['context']['tag'], ['priority' => -777]);

                    $container->setDefinition('coreshop.storage_list.context.customer_and_store_based.' . $name, $customerAndStoreBasedContextDefinition);

                    if ($list['services']['enable_default_store_based_decorator']) {
                        $storeBasedContextDefinition = new Definition(StoreBasedStorageListContext::class);
                        $storeBasedContextDefinition->setDecoratedService('coreshop.storage_list.context.factory.' . $name);
                        $storeBasedContextDefinition->setArgument(
                            '$context',
                            new Reference('coreshop.storage_list.context.store_based.' . $name . '.inner'),
                        );
                        $storeBasedContextDefinition->setArgument(
                            '$contextProvider',
                            new Reference('coreshop.storage_list.context_provider.' . $name),
                        );

                        $container->setDefinition(
                            'coreshop.storage_list.context.store_based.' . $name,
                            $storeBasedContextDefinition,
                        );
                    }

                    if ($list['session']['enabled']) {
                        $storageListStorageDefinition = new Definition(SessionStorageListStorage::class);
                        $storageListStorageDefinition->setArgument('$requestStack', new Reference('request_stack'));
                        $storageListStorageDefinition->setArgument('$sessionKeyName', $list['session']['key']);
                        $storageListStorageDefinition->setArgument('$repository', new Reference($list['resource']['repository']));

                        $container->setDefinition('coreshop.storage_list.storage.' . $name, $storageListStorageDefinition);

                        $sessionAndStoreBasedContextDefinition = new Definition(
                            SessionAndStoreBasedStorageListContext::class,
                        );
                        $sessionAndStoreBasedContextDefinition->setArgument('$storageListStorage', new Reference('coreshop.storage_list.storage.' . $name));
                        $sessionAndStoreBasedContextDefinition->setArgument('$storeContext', new Reference(StoreContextInterface::class));
                        $sessionAndStoreBasedContextDefinition->addTag($list['context']['tag'], ['priority' => -555]);

                        $container->setDefinition('coreshop.storage_list.context.session_and_store_based.' . $name, $sessionAndStoreBasedContextDefinition);

                        $sessionAndStoreSubscriber = new Definition(SessionStoreStorageListSubscriber::class);
                        $sessionAndStoreSubscriber->setArgument('$pimcoreContext', new Reference(PimcoreContextResolver::class));
                        $sessionAndStoreSubscriber->setArgument('$context', new Reference($contextCompositeServiceName));
                        $sessionAndStoreSubscriber->setArgument('$storageListStorage', new Reference('coreshop.storage_list.storage.' . $name));
                        $sessionAndStoreSubscriber->addTag('kernel.event_subscriber');

                        $container->setDefinition('coreshop.storage_list.session_and_store_subscriber.' . $name, $sessionAndStoreSubscriber);

                        if ($list['session']['enable_logout_subscriber']) {
                            $logoutSubscriber = new Definition(SessionStoreStorageListLogoutSubscriber::class);
                            $logoutSubscriber->setArgument('$context', new Reference($contextCompositeServiceName));
                            $logoutSubscriber->setArgument('$sessionKeyName', $list['session']['key']);
                            $logoutSubscriber->addTag(
                                'kernel.event_listener',
                                [
                                    'event' => LogoutEvent::class,
                                    'method' => 'onLogoutSuccess',
                                    'dispatcher' => 'security.event_dispatcher.coreshop_frontend',
                                ],
                            );

                            $container->setDefinition(
                                'coreshop.storage_list.logout_subscriber.' . $name,
                                $logoutSubscriber,
                            );
                        }
                    }

                    $blamer = new Definition(StorageListBlamerListener::class);
                    $blamer->setArgument('$context', new Reference($contextCompositeServiceName));
                    $blamer->addTag('kernel.event_listener', ['event' => 'security.interactive_login', 'method' => 'onInteractiveLogin']);
                    $blamer->addTag('kernel.event_listener', ['event' => 'coreshop.customer.register', 'method' => 'onRegisterEvent']);

                    $container->setDefinition('coreshop.storage_list.blamer.' . $name, $blamer);
                }

                if ($list['expiration']['enabled']) {
                    if ($list['expiration']['service']) {
                        $container->setAlias('coreshop.storage_list.expiration.' . $name, $list['expiration']['service']);
                    } else {
                        $expireService = new Definition(StorageListExpiration::class);
                        $expireService->setArgument('$repository', new Reference($list['resource']['repository']));

                        $container->setDefinition('coreshop.storage_list.expiration.' . $name, $expireService);
                    }

                    $expireTask = new Definition(ExpireTask::class);
                    $expireTask->setArgument(
                        '$expirationService',
                        new Reference('coreshop.storage_list.expiration.' . $name),
                    );
                    $expireTask->setArgument('$days', $list['expiration']['days']);
                    $expireTask->setArgument('$params', $list['expiration']['params'] ?? []);
                    $expireTask->setTags([
                        'pimcore.maintenance.task' => [
                            [
                                'type' => sprintf('coreshop_%s_storage_list_expiration', $name),
                            ],
                        ],
                    ]);

                    $container->setParameter('coreshop.storage_list.expiration.' . $name . '.days', $list['expiration']['days']);
                    $container->setParameter('coreshop.storage_list.expiration.' . $name . '.params', $list['expiration']['params'] ?? []);

                    $container->setDefinition('coreshop.storage_list.expiration.task.' . $name, $expireTask);
                }
            }

            if (!$contextsRegistered && $list['session']['enabled']) {
                $sessionContext = new Definition(
                    SessionBasedListContext::class,
                );
                $sessionContext->setArgument(
                    '$inner',
                    new Reference('coreshop.storage_list.context.' . $name . '.session.inner'),
                );
                $sessionContext->setArgument('$requestStack', new Reference('request_stack'));
                $sessionContext->setArgument('$sessionKeyName', $list['session']['key']);
                $sessionContext->setArgument('$repository', new Reference($list['resource']['repository']));
                $sessionContext->setDecoratedService('coreshop.storage_list.context.factory.' . $name);

                $container->setDefinition('coreshop.storage_list.context.' . $name . '.session', $sessionContext);
            }

            $tags[] = [
                $list['context']['interface'],
                $contextCompositeServiceName,
                $list['context']['tag'],
            ];
        }

        $container->setParameter('coreshop.storage_list.tags', $tags);
    }
}

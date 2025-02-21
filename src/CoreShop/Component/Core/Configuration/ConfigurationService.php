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

namespace CoreShop\Component\Core\Configuration;

use CoreShop\Component\Configuration\Model\ConfigurationInterface;
use CoreShop\Component\Configuration\Service\ConfigurationService as BaseConfigurationService;
use CoreShop\Component\Core\Repository\ConfigurationRepositoryInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Store\Context\StoreContextInterface;
use CoreShop\Component\Store\Context\StoreNotFoundException;
use CoreShop\Component\Store\Model\StoreInterface;
use Doctrine\ORM\EntityManagerInterface;

class ConfigurationService extends BaseConfigurationService implements ConfigurationServiceInterface
{
    protected ConfigurationRepositoryInterface $myConfigurationRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        ConfigurationRepositoryInterface $configurationRepository,
        FactoryInterface $configurationFactory,
        protected StoreContextInterface $storeContext,
    ) {
        parent::__construct($entityManager, $configurationRepository, $configurationFactory);

        $this->myConfigurationRepository = $configurationRepository;
    }

    public function getForStore(string $key, ?StoreInterface $store = null, $returnObject = false): mixed
    {
        if (null === $store) {
            $store = $this->getStore();
        }

        $config = $this->myConfigurationRepository->findForKeyAndStore($key, $store);

        if (null === $config) {
            $config = $this->myConfigurationRepository->findBy(['key' => $key, 'store' => null]);

            if (is_array($config) && count($config) > 0) {
                $config = $config[0];
            }
        }

        if ($config instanceof ConfigurationInterface) {
            return $returnObject ? $config : $config->getData();
        }

        return null;
    }

    public function setForStore(string $key, mixed $data, ?StoreInterface $store = null): \CoreShop\Component\Core\Model\ConfigurationInterface
    {
        if (null === $store) {
            $store = $this->getStore();
        }

        $config = $this->getForStore($key, $store, true);

        if (!$config) {
            $config = $this->configurationFactory->createNew();
            $config->setKey($key);
            $config->setStore($store);
        }

        $config->setData($data);
        $config->setStore($store);
        $this->entityManager->persist($config);
        $this->entityManager->flush();

        return $config;
    }

    public function removeForStore(string $key, ?StoreInterface $store = null): void
    {
        if (null === $store) {
            $store = $this->getStore();
        }

        $config = $this->getForStore($key, $store, true);

        if ($config instanceof ConfigurationInterface) {
            $this->entityManager->remove($config);
            $this->entityManager->flush();
        }
    }

    protected function getStore(): ?StoreInterface
    {
        try {
            return $this->storeContext->getStore();
        } catch (StoreNotFoundException) {
            //if we don't have a store, do nothing and return false
        }

        return null;
    }
}

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

namespace CoreShop\Bundle\TestBundle\Context\Hook;

use Behat\Behat\Context\Context;
use Doctrine\DBAL\Connection;
use Pimcore\Model\Asset;
use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\Fieldcollection;
use Pimcore\Model\DataObject\Listing;
use Pimcore\Model\DataObject\Objectbrick;
use Pimcore\Model\Document;
use Pimcore\Model\User;
use Symfony\Component\HttpKernel\KernelInterface;

class PimcoreDaoContext implements Context
{
    public function __construct(
        private KernelInterface $kernel,
        private Connection $connection,
    ) {
    }

    /**
     * @BeforeScenario
     */
    public function setKernel(): void
    {
        \Pimcore::setKernel($this->kernel);
    }

    /**
     * @BeforeScenario
     */
    public function clearRuntimeCacheScenario(): void
    {
        //Clearing it here is totally fine, since each scenario has its own separated context of objects
        \Pimcore\Cache\RuntimeCache::clear();
    }

    /**
     * @BeforeScenario
     */
    public function purgeObjects(): void
    {
        /**
         * @var Listing $list
         */
        $list = new DataObject\Listing();
        $list->setUnpublished(true);
        $list->setCondition('id <> 1');
        $list->load();

        foreach ($list->getObjects() as $obj) {
            $obj->delete();
        }

        //Force
        $this->connection->executeQuery('DELETE FROM objects WHERE id <> 1');
    }

    /**
     * @BeforeScenario
     */
    public function purgeDocuments(): void
    {
        /**
         * @var Document\Listing $list
         */
        $list = new Document\Listing();
        $list->setUnpublished(true);
        $list->setCondition('id <> 1');
        $list->load();

        foreach ($list->getDocuments() as $obj) {
            $obj->delete();
        }

        //Force
        $this->connection->executeQuery('DELETE FROM documents WHERE id <> 1');
        $this->connection->executeQuery('DELETE FROM documents_editables WHERE documentId <> 1');
        $this->connection->executeQuery('DELETE FROM documents_email WHERE id <> 1');
        $this->connection->executeQuery('DELETE FROM documents_hardlink WHERE id <> 1');
        $this->connection->executeQuery('DELETE FROM documents_link WHERE id <> 1');
        $this->connection->executeQuery('DELETE FROM documents_newsletter WHERE id <> 1');
        $this->connection->executeQuery('DELETE FROM documents_page WHERE id <> 1');
        $this->connection->executeQuery('DELETE FROM documents_snippet WHERE id <> 1');
        $this->connection->executeQuery('DELETE FROM documents_translations WHERE id <> 1');
    }

    /**
     * @BeforeScenario
     */
    public function purgeAssets(): void
    {
        /**
         * @var Asset\Listing $list
         */
        $list = new Asset\Listing();
        $list->setCondition('id <> 1');
        $list->load();

        foreach ($list->getAssets() as $asset) {
            $asset->delete();
        }
    }

    /**
     * @BeforeScenario
     */
    public function purgeTables(): void
    {
        $this->connection->executeQuery('DELETE FROM sites');
        $this->connection->executeQuery('DELETE FROM object_url_slugs');
    }

    /**
     * @BeforeScenario
     */
    public function purgeBricks(): void
    {
        $list = new Objectbrick\Definition\Listing();
        $list->load();

        foreach ($list->load() as $brick) {
            /**
             * @psalm-suppress DocblockTypeContradiction
             */
            if (!$brick instanceof Objectbrick\Definition) {
                continue;
            }

            if (str_starts_with($brick->getKey(), 'Behat')) {
                $brick->delete();
            }
        }
    }

    /**
     * @BeforeStep
     */
    public function clearRuntimeCacheStep(): void
    {
        //We should not clear Pimcore Objects here, otherwise we lose the reference to it
        //and end up having the same object twice
        $copy = \Pimcore\Cache\RuntimeCache::getInstance()->getArrayCopy();
        $keepItems = [];

        foreach ($copy as $key => $value) {
            if (str_starts_with($key, 'object_')) {
                $keepItems[] = $key;
            }
        }

        \Pimcore\Cache\RuntimeCache::clear($keepItems);
    }

    /**
     * @BeforeScenario
     */
    public function purgeClasses(): void
    {
        $list = new ClassDefinition\Listing();
        $list->setCondition('name LIKE ?', ['Behat%']);
        $list->load();

        foreach ($list->getClasses() as $class) {
            /**
             * @psalm-suppress DocblockTypeContradiction
             */
            if (!$class instanceof ClassDefinition) {
                continue;
            }

            $class->delete();
        }
    }

    /**
     * @BeforeScenario
     */
    public function clearBehatAdminUser(): void
    {
        $user = User::getByName('behat-admin');

        if ($user) {
            $user->delete();
        }
    }

    /**
     * @BeforeScenario
     */
    public function clearSlugs(): void
    {
        $this->connection->executeQuery('DELETE FROM `object_url_slugs`');

        $reflection = new \ReflectionClass(DataObject\Data\UrlSlug::class);

        if ($reflection->hasProperty('cache')) {
            $cacheProperty = $reflection->getProperty('cache');
            $cacheProperty->setAccessible(true);
            $reflection->setStaticPropertyValue('cache', []);
        }
    }

    /**
     * @BeforeScenario
     */
    public function disableGlobalInheritance(): void
    {
        DataObject\AbstractObject::setGetInheritedValues(false);
    }

    /**
     * @BeforeScenario
     */
    public function purgeFieldCollections(): void
    {
        $list = new Fieldcollection\Definition\Listing();
        $list->load();

        foreach ($list->load() as $collection) {
            /**
             * @psalm-suppress DocblockTypeContradiction
             */
            if (!$collection instanceof Fieldcollection\Definition) {
                continue;
            }

            if (str_starts_with($collection->getKey(), 'Behat')) {
                $collection->delete();
            }
        }
    }
}

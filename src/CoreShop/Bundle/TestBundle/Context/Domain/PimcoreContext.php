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

namespace CoreShop\Bundle\TestBundle\Context\Domain;

use Behat\Behat\Context\Context;
use CoreShop\Component\Pimcore\BatchProcessing\DataObjectBatchListing;
use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\Listing;
use Webmozart\Assert\Assert;

final class PimcoreContext implements Context
{
    public function __construct(
        private string $webRoot,
        private array $adminJs,
        private array $adminCss,
        private array $editmodeJs,
        private array $editmodeCss,
    ) {
    }

    /**
     * @Then /^all admin js resources should exist$/
     */
    public function allAdminJsResourceShouldExist(): void
    {
        $this->checkFilesExist($this->adminJs, 'Admin JS');
    }

    /**
     * @Then /^all admin css resources should exist$/
     */
    public function allAdminCssResourceShouldExist(): void
    {
        $this->checkFilesExist($this->adminCss, 'Admin CSS');
    }

    /**
     * @Then /^all editmode js resources should exist$/
     */
    public function allEditmodeJsResourceShouldExist(): void
    {
        $this->checkFilesExist($this->editmodeJs, 'Editmode JS');
    }

    /**
     * @Then /^all editmode css resources should exist$/
     */
    public function allEditmodeCssResourceShouldExist(): void
    {
        $this->checkFilesExist($this->editmodeCss, 'Editmode CSS');
    }

    /**
     * @Then /^iterating the (class|behat-class "[^"]+") should return (\d+) objects$/
     */
    public function iteratingTheClassShouldReturn(ClassDefinition $definition, int $count): void
    {
        $list = $this->getListingFromClassDefinition($definition);
        $batchListing = new DataObjectBatchListing($list, 1);

        Assert::eq($batchListing->count(), $count);
        Assert::eq($this->countBatchListingObjects($batchListing), $count);
    }

    /**
     * @Then /^iterating the (class|behat-class "[^"]+") with a offset of (\d+) should return (\d+) objects$/
     */
    public function iteratingTheClassWithAOffsetShouldReturn(ClassDefinition $definition, int $offset, int $count): void
    {
        $list = $this->getListingFromClassDefinition($definition);
        $list->setOffset($offset);

        $batchListing = new DataObjectBatchListing($list, 1);

        Assert::eq($batchListing->count(), $count);
        Assert::eq($this->countBatchListingObjects($batchListing), $count);
    }

    /**
     * @Then /^iterating the (class|behat-class "[^"]+") with a offset of (\d+) and limit of (\d+) should return (\d+) objects$/
     */
    public function iteratingTheClassWithAOffsetAndLimitShouldReturn(ClassDefinition $definition, int $offset, int $limit, int $count): void
    {
        $list = $this->getListingFromClassDefinition($definition);
        $list->setOffset($offset);
        $list->setLimit($limit);

        $batchListing = new DataObjectBatchListing($list, 1);

        Assert::eq($batchListing->count(), $count);
        Assert::eq($this->countBatchListingObjects($batchListing), $count);
    }

    private function countBatchListingObjects(DataObjectBatchListing $batchListing): int
    {
        $count = 0;

        foreach ($batchListing as $object) {
            ++$count;
        }

        return $count;
    }

    private function getListingFromClassDefinition(ClassDefinition $definition): Listing
    {
        /**
         * @psalm-var class-string $className
         */
        $className = sprintf('Pimcore\\Model\\DataObject\\%s\\Listing', $definition->getName());

        $list = new $className();

        /**
         * @Listing $list
         */
        Assert::isInstanceOf($list, Listing::class);

        return $list;
    }

    private function checkFilesExist(array $files, string $type): void
    {
        foreach ($files as $file) {
            Assert::true($this->checkFileExists($file), sprintf('File "%s" for type %s not found', $file, $type));
        }
    }

    private function checkFileExists(string $file): bool
    {
        return file_exists(sprintf('%s%s', $this->webRoot, $file));
    }
}

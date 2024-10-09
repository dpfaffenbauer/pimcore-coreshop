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

namespace CoreShop\Behat\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Repository\ProductRepositoryInterface;
use Pimcore\Model\DataObject\AbstractObject;
use Webmozart\Assert\Assert;

final class ProductContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ProductRepositoryInterface $productRepository,
    ) {
    }

    /**
     * @Transform /^product(?:|s) "([^"]+)"$/
     * @Transform /^"([^"]+)" product(?:|s)$/
     */
    public function getProductByName($productName)
    {
        /**
         * @var \Pimcore\Model\DataObject\Listing\Concrete $list
         */
        $list = $this->productRepository->getList();
        $list->setLocale('en');
        $list->setObjectTypes([AbstractObject::OBJECT_TYPE_OBJECT, AbstractObject::OBJECT_TYPE_VARIANT]);
        $list->setCondition('name = ?', [$productName]);
        $list->load();

        Assert::eq(
            count($list->getObjects()),
            1,
            sprintf('%d products has been found with name "%s".', count($list->getObjects()), $productName),
        );

        $objects = $list->getObjects();
        $product = \reset($objects);

        //This is to not run into cache issues
        return $this->productRepository->forceFind($product->getId());
    }

    /**
     * @Transform /^product with key "([^"]+)"$/
     * @Transform /^variant with key "([^"]+)"$/
     */
    public function getProductByKey($productName)
    {
        /**
         * @var \Pimcore\Model\DataObject\Listing\Concrete $list
         */
        $list = $this->productRepository->getList();
        $list->setLocale('en');
        $list->setObjectTypes([AbstractObject::OBJECT_TYPE_OBJECT, AbstractObject::OBJECT_TYPE_VARIANT]);
        $list->setCondition('`key` = ?', [$productName]);
        $list->load();

        Assert::eq(
            count($list->getObjects()),
            1,
            sprintf('%d products has been found with key "%s".', count($list->getObjects()), $productName),
        );

        $objects = $list->getObjects();
        $product = \reset($objects);

        //This is to not run into cache issues
        return $this->productRepository->forceFind($product->getId());
    }

    /**
     * @Transform /^product(?:|s) "([^"]+)" with unit "([^"]+)"$/
     */
    public function getProductWithUnitName($productName, $productUnit): array
    {
        /**
         * @var ProductInterface $product
         */
        $product = $this->getProductByName($productName);

        foreach ($product->getUnitDefinitions()->getUnitDefinitions() as $unit) {
            if ($unit->getUnit()->getName() === $productUnit) {
                return [
                    'product' => $product,
                    'unit' => $unit,
                ];
            }
        }

        throw new \Exception(sprintf('Unit %s in product %s not found', $productUnit, $productName));
    }

    /**
     * @Transform /^products "([^"]+)", "([^"]+)"$/
     */
    public function getProductsByName(string $product1, string $product2): array
    {
        $products = [];

        foreach ([$product1, $product2] as $cat) {
            $products[] = $this->getProductByName($cat);
        }

        return $products;
    }

    /**
     * @Transform /^product/
     */
    public function product(): ProductInterface
    {
        return $this->sharedStorage->get('product');
    }

    /**
     * @Transform /^variant(?:|s)/
     * @Transform /^variant(?:|s)/
     */
    public function variant(): ProductInterface
    {
        return $this->sharedStorage->get('variant');
    }
}

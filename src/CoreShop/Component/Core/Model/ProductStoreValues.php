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

namespace CoreShop\Component\Core\Model;

use CoreShop\Component\Resource\Model\AbstractResource;
use CoreShop\Component\Store\Model\StoreAwareTrait;
use CoreShop\Component\Taxation\Model\TaxRuleGroupInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * @psalm-suppress MissingConstructor
 */
class ProductStoreValues extends AbstractResource implements ProductStoreValuesInterface, \Stringable
{
    use StoreAwareTrait;

    protected ?int $id = null;

    protected ?string $fieldName = null;

    protected int $price = 0;

    protected ?TaxRuleGroupInterface $taxRule = null;

    protected ?ProductInterface $product = null;

    /**
     * @var Collection<int, ProductUnitDefinitionPriceInterface>|ProductUnitDefinitionPriceInterface[]
     */
    protected $productUnitDefinitionPrices;

    public function __construct(
        ) {
        $this->productUnitDefinitionPrices = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getFieldName(): ?string
    {
        return $this->fieldName;
    }

    public function setFieldName(?string $fieldName): void
    {
        $this->fieldName = $fieldName;
    }

    public function getPrice(): int
    {
        return $this->price;
    }

    public function setPrice(int $price): void
    {
        $this->price = $price;
    }

    public function getTaxRule(): ?TaxRuleGroupInterface
    {
        return $this->taxRule;
    }

    public function setTaxRule(?TaxRuleGroupInterface $taxRule): void
    {
        $this->taxRule = $taxRule;
    }

    public function addProductUnitDefinitionPrice(ProductUnitDefinitionPriceInterface $productUnitDefinitionPrice): void
    {
        if (!$this->productUnitDefinitionPrices->contains($productUnitDefinitionPrice)) {
            $productUnitDefinitionPrice->setProductStoreValues($this);
            $this->productUnitDefinitionPrices->add($productUnitDefinitionPrice);
        }
    }

    public function removeProductUnitDefinitionPrice(ProductUnitDefinitionPriceInterface $productUnitDefinitionPrice): void
    {
        if ($this->productUnitDefinitionPrices->contains($productUnitDefinitionPrice)) {
            $this->productUnitDefinitionPrices->removeElement($productUnitDefinitionPrice);
        }
    }

    public function getProductUnitDefinitionPrices()
    {
        return $this->productUnitDefinitionPrices;
    }

    public function getProduct(): ?ProductInterface
    {
        return $this->product;
    }

    public function setProduct(ProductInterface $product): void
    {
        $this->product = $product;
    }

    public function __toString(): string
    {
        return sprintf('Price: %s (Store: %d)', $this->getPrice(), $this->getStore()->getId());
    }
}

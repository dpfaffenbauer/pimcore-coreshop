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

namespace CoreShop\Component\Product\Model;

use CoreShop\Component\Resource\Model\AbstractResource;

/**
 * @psalm-suppress MissingConstructor
 */
class ProductUnitDefinition extends AbstractResource implements ProductUnitDefinitionInterface, \Stringable
{
    /**
     * @var int|null
     */
    protected $id;

    /**
     * @var ProductUnitInterface
     */
    protected $unit;

    /**
     * @var float
     */
    protected $conversionRate;

    /**
     * @var int
     */
    protected $precision = 0;

    /**
     * @var ProductUnitDefinitionsInterface
     */
    protected $productUnitDefinitions;

    public function setId(int $id)
    {
        $this->id = $id;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUnit()
    {
        return $this->unit;
    }

    public function setUnit(ProductUnitInterface $unit)
    {
        $this->unit = $unit;
    }

    public function getConversionRate()
    {
        return $this->conversionRate;
    }

    public function setConversionRate(?float $conversionRate = null)
    {
        $this->conversionRate = $conversionRate;
    }

    public function getPrecision()
    {
        return $this->precision;
    }

    public function setPrecision(int $precision)
    {
        $this->precision = $precision;
    }

    public function getProductUnitDefinitions()
    {
        return $this->productUnitDefinitions;
    }

    public function setProductUnitDefinitions(?ProductUnitDefinitionsInterface $productUnitDefinitions = null)
    {
        $this->productUnitDefinitions = $productUnitDefinitions;
    }

    public function getUnitName()
    {
        if ($unit = $this->getUnit()) {
            return $unit->getName();
        }

        return null;
    }

    public function __toString(): string
    {
        return sprintf('%s, (Conversion Rate: %s)', $this->getUnitName(), $this->getConversionRate());
    }
}

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

use CoreShop\Component\Resource\Model\ResourceInterface;

interface ProductUnitDefinitionInterface extends ResourceInterface
{
    public function getId(): ?int;

    /**
     * @return ProductUnitInterface|null
     */
    public function getUnit();

    public function setUnit(ProductUnitInterface $unit);

    /**
     * @return float|null
     */
    public function getConversionRate();

    public function setConversionRate(?float $conversionRate = null);

    /**
     * @return int
     */
    public function getPrecision();

    public function setPrecision(int $precision);

    /**
     * @return ProductUnitDefinitionsInterface|null
     */
    public function getProductUnitDefinitions();

    public function setProductUnitDefinitions(?ProductUnitDefinitionsInterface $productUnitDefinitions = null);

    /**
     * @return string|null
     */
    public function getUnitName();
}

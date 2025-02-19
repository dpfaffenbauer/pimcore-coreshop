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

use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use CoreShop\Component\ProductQuantityPriceRules\Model\QuantityRangeInterface as BaseQuantityRangeInterface;

interface QuantityRangeInterface extends BaseQuantityRangeInterface
{
    /**
     * @return int
     */
    public function getAmount();

    public function setAmount(int $amount);

    /**
     * @return CurrencyInterface|null
     */
    public function getCurrency();

    public function setCurrency(?CurrencyInterface $currency = null);

    /**
     * @return ProductUnitDefinitionInterface|null
     */
    public function getUnitDefinition();

    public function setUnitDefinition(?ProductUnitDefinitionInterface $unitDefinition = null);

    /**
     * @return bool
     */
    public function hasUnitDefinition();

    public function setPseudoPrice(int $pseudoPrice);

    /**
     * @return int
     */
    public function getPseudoPrice();

    /**
     * @return bool
     */
    public function hasPseudoPrice();
}

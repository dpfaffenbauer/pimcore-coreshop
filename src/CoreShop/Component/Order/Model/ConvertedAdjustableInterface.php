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

namespace CoreShop\Component\Order\Model;

interface ConvertedAdjustableInterface
{
    /**
     * @return AdjustmentInterface[]
     */
    public function getConvertedAdjustments(?string $type = null);

    public function addConvertedAdjustment(AdjustmentInterface $adjustment);

    public function removeConvertedAdjustment(AdjustmentInterface $adjustment);

    public function getConvertedAdjustmentsTotal(?string $type = null, bool $withTax = true): int;

    public function removeConvertedAdjustments(?string $type = null);

    public function removeConvertedAdjustmentsRecursively(?string $type = null);

    /**
     * Recalculates adjustments total. Should be used after adjustment change.
     */
    public function recalculateConvertedAdjustmentsTotal();
}

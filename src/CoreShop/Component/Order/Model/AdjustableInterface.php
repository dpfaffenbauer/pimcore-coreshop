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

interface AdjustableInterface
{
    /**
     * @return AdjustmentInterface[]
     */
    public function getAdjustments(?string $type = null);

    public function addAdjustment(AdjustmentInterface $adjustment);

    public function removeAdjustment(AdjustmentInterface $adjustment);

    public function getAdjustmentsTotal(?string $type = null, bool $withTax = true): int;

    public function getNeutralAdjustmentsTotal(?string $type = null, bool $withTax = true): int;

    public function removeAdjustments(?string $type = null);

    public function removeAdjustmentsRecursively(?string $type = null);

    /**
     * Recalculates adjustments total. Should be used after adjustment change.
     */
    public function recalculateAdjustmentsTotal();
}

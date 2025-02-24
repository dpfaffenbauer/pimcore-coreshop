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

use CoreShop\Component\Resource\Exception\ImplementedByPimcoreException;
use Pimcore\Model\DataObject\Fieldcollection;

trait AdjustableTrait
{
    public function setPimcoreAdjustmentTotalNet(int $adjustmentTotalNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getPimcoreAdjustmentTotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setPimcoreAdjustmentTotalGross(int $adjustmentTotalGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getPimcoreAdjustmentTotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    /**
     * @return Fieldcollection|null
     */
    public function getAdjustmentItems()
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setAdjustmentItems(?Fieldcollection $adjustmentItems)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function hasAdjustments()
    {
        return $this->getAdjustmentItems() instanceof Fieldcollection && $this->getAdjustmentItems()->getCount() > 0;
    }

    /**
     * @return AdjustmentInterface[]
     */
    public function getAdjustments(?string $type = null)
    {
        $adjustments = [];

        if ($this->getAdjustmentItems() instanceof Fieldcollection) {
            foreach ($this->getAdjustmentItems() as $item) {
                if ($item instanceof AdjustmentInterface) {
                    $adjustments[] = $item;
                }
            }
        }

        if (null === $type) {
            return $adjustments;
        }

        return array_filter(
            $adjustments,
            function (AdjustmentInterface $adjustment) use ($type) {
                return $type === $adjustment->getTypeIdentifier();
            },
        );
    }

    public function hasAdjustment(AdjustmentInterface $adjustment)
    {
        $items = $this->getAdjustmentItems();

        if ($items instanceof Fieldcollection) {
            foreach ($items as $item) {
                if ($item instanceof AdjustmentInterface) {
                    if ($item === $adjustment) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public function addAdjustment(AdjustmentInterface $adjustment)
    {
        if (!$this->hasAdjustment($adjustment)) {
            $items = $this->getAdjustmentItems();

            if (!$items instanceof Fieldcollection) {
                $items = new Fieldcollection();
            }

            if ($adjustment instanceof Fieldcollection\Data\AbstractData) {
                /**
                 * @psalm-suppress InvalidArgument
                 */
                $items->add($adjustment);
            }

            $this->setAdjustmentItems($items);

            $this->recalculateAdjustmentsTotal();
        }
    }

    public function removeAdjustment(AdjustmentInterface $adjustment)
    {
        $items = $this->getAdjustmentItems();

        if ($items instanceof Fieldcollection) {
            for ($i = 0, $c = $items->getCount(); $i < $c; ++$i) {
                $arrayItem = $items->get($i);

                if ($arrayItem === $adjustment) {
                    $items->remove($i);

                    break;
                }
            }

            $this->setAdjustmentItems($items);
            $this->recalculateAdjustmentsTotal();
        }

        $this->addToAdjustmentsTotal($adjustment);
    }

    public function removeAdjustments(?string $type = null)
    {
        foreach ($this->getAdjustments($type) as $adjustment) {
            $this->removeAdjustment($adjustment);
        }
    }

    public function removeAdjustmentsRecursively(?string $type = null)
    {
        $this->removeAdjustments($type);

        if (method_exists($this, 'getItems')) {
            foreach ($this->getItems() as $item) {
                if ($item instanceof AdjustableInterface) {
                    $item->removeAdjustmentsRecursively($type);
                }
            }
        }
    }

    public function getAdjustmentsTotal(?string $type = null, bool $withTax = true): int
    {
        if (null === $type) {
            if ($withTax) {
                return $this->getPimcoreAdjustmentTotalGross() ?: 0;
            }

            return $this->getPimcoreAdjustmentTotalNet() ?: 0;
        }

        $total = 0;
        foreach ($this->getAdjustments($type) as $adjustment) {
            if (!$adjustment->getNeutral()) {
                $total += $adjustment->getAmount($withTax);
            }
        }

        return $total;
    }

    public function getNeutralAdjustmentsTotal(?string $type = null, bool $withTax = true): int
    {
        if (null === $type) {
            if ($withTax) {
                return $this->getPimcoreAdjustmentTotalGross() ?: 0;
            }

            return $this->getPimcoreAdjustmentTotalNet() ?: 0;
        }

        $total = 0;
        foreach ($this->getAdjustments($type) as $adjustment) {
            if ($adjustment->getNeutral()) {
                $total += $adjustment->getAmount($withTax);
            }
        }

        return $total;
    }

    public function recalculateAdjustmentsTotal()
    {
        $adjustmentsTotalGross = 0;
        $adjustmentsTotalNet = 0;

        foreach ($this->getAdjustments() as $adjustment) {
            if (!$adjustment->getNeutral()) {
                $adjustmentsTotalGross += $adjustment->getAmount(true);
                $adjustmentsTotalNet += $adjustment->getAmount(false);
            }
        }

        $this->setPimcoreAdjustmentTotalGross($adjustmentsTotalGross);
        $this->setPimcoreAdjustmentTotalNet($adjustmentsTotalNet);

        $this->recalculateAfterAdjustmentChange();
    }

    protected function addToAdjustmentsTotal(AdjustmentInterface $adjustment)
    {
        if (!$adjustment->getNeutral()) {
            $this->recalculateAdjustmentsTotal();
            $this->recalculateAfterAdjustmentChange();
        }
    }

    protected function subtractFromAdjustmentsTotal(AdjustmentInterface $adjustment)
    {
        if (!$adjustment->getNeutral()) {
            $this->recalculateAdjustmentsTotal();
            $this->recalculateAfterAdjustmentChange();
        }
    }

    abstract protected function recalculateAfterAdjustmentChange(): void;
}

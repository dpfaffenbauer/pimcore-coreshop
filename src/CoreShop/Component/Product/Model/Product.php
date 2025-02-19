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

use CoreShop\Component\Resource\Model\ToggleableTrait;
use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreModel;
use Pimcore\Model\Asset\Image;

abstract class Product extends AbstractPimcoreModel implements ProductInterface
{
    use ToggleableTrait;

    public function getImage(): ?Image
    {
        if (count($this->getImages()) > 0) {
            return $this->getImages()[0];
        }

        return null;
    }

    public function hasUnitDefinitions(): bool
    {
        return $this->getUnitDefinitions() instanceof ProductUnitDefinitionsInterface && $this->getUnitDefinitions()->getUnitDefinitions()->count() > 0;
    }

    public function hasDefaultUnitDefinition(): bool
    {
        return $this->hasUnitDefinitions() && $this->getUnitDefinitions()->getDefaultUnitDefinition() instanceof ProductUnitDefinitionInterface;
    }

    public function hasAdditionalUnitDefinitions(): bool
    {
        return $this->hasUnitDefinitions() && $this->getUnitDefinitions()->getAdditionalUnitDefinitions()->count() > 0;
    }

    public function getNameForSlug(?string $language = null): ?string
    {
        return $this->getName($language);
    }
}

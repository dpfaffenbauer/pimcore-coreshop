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

namespace CoreShop\Component\Variant\Model;

use CoreShop\Component\Resource\Pimcore\Model\PimcoreModelInterface;

interface AttributeInterface extends PimcoreModelInterface
{
    public function getName(?string $language = null): ?string;

    public function setName(?string $name, ?string $language = null);

    public function getValueText(): ?string;

    public function setValueText(?string $valueText);

    public function getAttributeGroup(): ?AttributeGroupInterface;

    public function setAttributeGroup(?AttributeGroupInterface $attributeGroup);

    public function getSorting(): ?float;

    public function setSorting(?float $sorting);
}

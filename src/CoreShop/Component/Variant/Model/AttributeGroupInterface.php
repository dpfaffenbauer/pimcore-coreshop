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

interface AttributeGroupInterface extends PimcoreModelInterface
{
    public function getName(?string $language = null): ?string;

    public function setName(?string $name, ?string $language = null): static;

    public function getSorting(): ?float;

    public function setSorting(?float $sorting): static;

    public function getShowInList(): ?bool;

    public function setShowInList(?bool $showInList): static;

    public function getAttributes(): array;
}

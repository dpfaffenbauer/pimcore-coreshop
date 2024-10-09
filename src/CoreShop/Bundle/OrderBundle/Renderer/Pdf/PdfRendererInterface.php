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

namespace CoreShop\Bundle\OrderBundle\Renderer\Pdf;

/**
 * @deprecated Deprecated since CoreShop 4.1, to be removed in CoreShop 5.0. No replacement available, use Pimcore's Web2Print Renderer instead.
 */
interface PdfRendererInterface
{
    public function fromString(string $string, string $header = '', string $footer = '', array $config = []): string;
}

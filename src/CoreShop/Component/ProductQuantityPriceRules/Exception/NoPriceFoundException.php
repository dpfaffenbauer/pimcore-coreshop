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

namespace CoreShop\Component\ProductQuantityPriceRules\Exception;

class NoPriceFoundException extends \RuntimeException
{
    public function __construct(
        $calculatorClass,
        ?\Exception $previousException = null,
    ) {
        parent::__construct(sprintf('Quantity Price Calculator "%s" was not able to match a valid price.', $calculatorClass), 0, $previousException);
    }
}

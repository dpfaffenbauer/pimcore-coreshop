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

namespace CoreShop\Bundle\MoneyBundle\Formatter;

use CoreShop\Component\Currency\Formatter\MoneyFormatterInterface;
use Webmozart\Assert\Assert;

final class MoneyFormatter implements MoneyFormatterInterface
{
    public function __construct(
        private int $decimalFactor,
    ) {
    }

    public function format(int $amount, string $currencyCode, string $locale = 'en', int $fraction = 2, ?int $factor = null): string
    {
        $formatter = new \NumberFormatter($locale, \NumberFormatter::CURRENCY);
        $formatter->setAttribute(\NumberFormatter::FRACTION_DIGITS, $fraction);

        $result = $formatter->formatCurrency(abs($amount / ($factor ?? $this->decimalFactor)), $currencyCode);
        Assert::notSame(
            false,
            $result,
            sprintf('The amount "%s" of type %s cannot be formatted to currency "%s".', $amount, gettype($amount), $currencyCode),
        );

        return $amount >= 0 ? $result : '-' . $result;
    }
}

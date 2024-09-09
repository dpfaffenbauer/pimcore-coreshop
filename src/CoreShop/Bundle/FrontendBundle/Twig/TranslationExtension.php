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

namespace CoreShop\Bundle\FrontendBundle\Twig;

use Symfony\Component\Intl\Countries;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

final class TranslationExtension extends AbstractExtension
{
    public function __construct(
        protected TranslatorInterface $translator,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('coreshop_country_name', [$this, 'countryName']),
        ];
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('coreshop_country_name', [$this, 'countryName']),
        ];
    }

    public function countryName(?string $country, string $locale = null): string
    {
        if (null === $country) {
            return '';
        }

        if ('EN' === $country) {
            $country = 'GB';
        }

        return Countries::getName($country, $locale);
    }
}

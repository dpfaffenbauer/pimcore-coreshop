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

namespace CoreShop\Component\Address\Context\RequestBased;

use CoreShop\Component\Address\Context\CountryContextInterface;
use CoreShop\Component\Address\Context\CountryNotFoundException;
use CoreShop\Component\Address\Model\CountryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

final class CountryContext implements CountryContextInterface
{
    public function __construct(
        private RequestResolverInterface $requestResolver,
        private RequestStack $requestStack,
    ) {
    }

    public function getCountry(): CountryInterface
    {
        try {
            return $this->getCountryForRequest($this->getMainRequest());
        } catch (\UnexpectedValueException $exception) {
            throw new CountryNotFoundException($exception);
        }
    }

    private function getCountryForRequest(Request $request): CountryInterface
    {
        $country = $this->requestResolver->findCountry($request);

        $this->assertCountryWasFound($country);

        return $country;
    }

    private function getMainRequest(): Request
    {
        $masterRequest = $this->requestStack->getMainRequest();
        if (null === $masterRequest) {
            throw new \UnexpectedValueException('There are not any requests on request stack');
        }

        return $masterRequest;
    }

    private function assertCountryWasFound(?CountryInterface $country = null): void
    {
        if (null === $country) {
            throw new \UnexpectedValueException('Country was not found for given request');
        }
    }
}

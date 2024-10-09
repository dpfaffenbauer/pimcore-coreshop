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

namespace CoreShop\Behat\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Repository\CurrencyRepositoryInterface;
use Webmozart\Assert\Assert;

final class CurrencyContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private CurrencyRepositoryInterface $currencyRepository,
    ) {
    }

    /**
     * @Transform /^currency "([^"]+)"$/
     */
    public function getCurrencyByIso($iso): CurrencyInterface
    {
        /**
         * @var CurrencyInterface[] $currencies
         */
        $currencies = $this->currencyRepository->findBy(['isoCode' => $iso]);

        Assert::eq(
            count($currencies),
            1,
            sprintf('%d currencies has been found with iso "%s".', count($currencies), $iso),
        );

        return reset($currencies);
    }

    /**
     * @Transform /^currency$/
     */
    public function latestCurrency(): CurrencyInterface
    {
        return $this->sharedStorage->get('currency');
    }
}

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

namespace CoreShop\Component\Product\Rule\Action;

use CoreShop\Component\Currency\Converter\CurrencyConverterInterface;
use CoreShop\Component\Currency\Model\CurrencyInterface;
use CoreShop\Component\Currency\Repository\CurrencyRepositoryInterface;
use CoreShop\Component\Product\Exception\NoRetailPriceFoundException;
use CoreShop\Component\Product\Model\ProductInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use Webmozart\Assert\Assert;

class PriceActionProcessor implements ProductPriceActionProcessorInterface
{
    public function __construct(
        protected CurrencyRepositoryInterface $currencyRepository,
        protected CurrencyConverterInterface $moneyConverter,
    ) {
    }

    public function getPrice($subject, array $context, array $configuration): int
    {
        if (!$subject instanceof ProductInterface) {
            throw new NoRetailPriceFoundException(__CLASS__);
        }

        if (isset($context['unitDefinition']) && $context['unitDefinition'] instanceof ProductUnitDefinitionInterface) {
            $defaultUnitId = $subject->getUnitDefinitions()?->getDefaultUnitDefinition()?->getId();

            if ($context['unitDefinition']->getId() !== $defaultUnitId) {
                throw new NoRetailPriceFoundException(__CLASS__);
            }
        }

        Assert::keyExists($context, 'base_currency');
        Assert::isInstanceOf($context['base_currency'], CurrencyInterface::class);

        /**
         * @var CurrencyInterface $contextCurrency
         */
        $contextCurrency = $context['base_currency'];
        $price = (int) $configuration['price'];

        /**
         * @var CurrencyInterface $currency
         */
        $currency = $this->currencyRepository->find($configuration['currency']);

        Assert::isInstanceOf($currency, CurrencyInterface::class);

        return $this->moneyConverter->convert($price, $currency->getIsoCode(), $contextCurrency->getIsoCode());
    }
}

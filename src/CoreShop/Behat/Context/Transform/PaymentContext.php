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
use CoreShop\Component\Core\Model\PaymentProviderInterface;
use CoreShop\Component\Core\Repository\PaymentProviderRepositoryInterface;
use CoreShop\Component\Payment\Model\PaymentProviderRuleInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Webmozart\Assert\Assert;

final class PaymentContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private PaymentProviderRepositoryInterface $paymentProviderRepository,
        private RepositoryInterface $paymentRuleRepository,
    ) {
    }

    /**
     * @Transform /^payment provider "([^"]+)"$/
     */
    public function getPaymentProviderByTitle($title): PaymentProviderInterface
    {
        /**
         * @var PaymentProviderInterface[] $paymentProviders
         */
        $paymentProviders = $this->paymentProviderRepository->findByTitle($title, 'en');

        Assert::eq(
            count($paymentProviders),
            1,
            sprintf('%d payment provider has been found with name "%s".', count($paymentProviders), $title),
        );

        return reset($paymentProviders);
    }

    /**
     * @Transform /^payment provider/
     */
    public function paymentProvider(): PaymentProviderInterface
    {
        return $this->sharedStorage->get('payment-provider');
    }

    /**
     * @Transform /^payment-provider-rule "([^"]+)"$/
     */
    public function getPaymentProviderRuleByName(string $ruleName): PaymentProviderRuleInterface
    {
        $rule = $this->paymentRuleRepository->findOneBy(['name' => $ruleName]);

        Assert::isInstanceOf($rule, PaymentProviderRuleInterface::class);

        return $rule;
    }

    /**
     * @Transform /^payment-provider-rule$/
     */
    public function getLatestPaymentProviderRule(): PaymentProviderRuleInterface
    {
        $resource = $this->sharedStorage->get('payment-provider-rule');

        Assert::isInstanceOf($resource, PaymentProviderRuleInterface::class);

        return $resource;
    }
}

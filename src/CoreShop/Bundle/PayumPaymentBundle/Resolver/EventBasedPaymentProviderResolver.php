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

namespace CoreShop\Bundle\PayumPaymentBundle\Resolver;

use CoreShop\Bundle\PayumPaymentBundle\Event\PaymentProviderSupportsEvent;
use CoreShop\Bundle\PayumPaymentBundle\Events;
use CoreShop\Component\Payment\Resolver\PaymentProviderResolverInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class EventBasedPaymentProviderResolver implements PaymentProviderResolverInterface
{
    public function __construct(
        private PaymentProviderResolverInterface $inner,
        private EventDispatcherInterface $eventDispatcher,
    ) {
    }

    public function resolvePaymentProviders(?ResourceInterface $subject = null): array
    {
        $allowedPaymentProviders = [];

        foreach ($this->inner->resolvePaymentProviders($subject) as $paymentProvider) {
            $event = new PaymentProviderSupportsEvent($paymentProvider, $subject);

            $this->eventDispatcher->dispatch($event, Events::SUPPORTS_PAYMENT_PROVIDER);

            if ($event->isSupported()) {
                $allowedPaymentProviders[] = $paymentProvider;
            }
        }

        return $allowedPaymentProviders;
    }
}

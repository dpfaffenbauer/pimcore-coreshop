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

namespace CoreShop\Bundle\TestBundle\Service;

use Behat\Mink\Driver\PantherDriver;
use Behat\Mink\Exception\DriverException;
use Behat\Mink\Session;

class CookieSetter implements CookieSetterInterface
{
    public function __construct(
        protected Session $minkSession,
        protected array | \ArrayAccess $minkParameters,
    ) {
    }

    public function setCookie(string $name, string $value): void
    {
        $this->prepareMinkSessionIfNeeded($this->minkSession);

        $this->minkSession->setCookie($name, $value);
    }

    protected function prepareMinkSessionIfNeeded(Session $session): void
    {
        if ($this->shouldMinkSessionBePrepared($session)) {
            $session->visit(rtrim($this->minkParameters['base_url'] . '/en/shop', '/') . '/');
        }
    }

    protected function shouldMinkSessionBePrepared(Session $session): bool
    {
        $driver = $session->getDriver();

        try {
            if ($driver instanceof PantherDriver && $driver->getClient()) {
                return true;
            }
        } catch (DriverException) {
            return true;
        }

        return !(str_contains($session->getCurrentUrl(), $this->minkParameters['base_url']));
    }
}

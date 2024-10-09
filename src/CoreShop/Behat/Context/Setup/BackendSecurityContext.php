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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\PimcoreSecurityServiceInterface;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Model\User;

final class BackendSecurityContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private PimcoreSecurityServiceInterface $securityService,
    ) {
    }

    /**
     * @Given I am a logged in admin
     */
    public function iAmLoggedInAdmin(): void
    {
        $user = new User();
        $user
            ->setName('behat-admin')
            ->setPassword('behat-admin')
            ->setAdmin(true)
            ->setCloseWarning(false)
            ->save()
        ;

        $this->securityService->logIn($user);

        $this->sharedStorage->set('user', $user);
    }
}

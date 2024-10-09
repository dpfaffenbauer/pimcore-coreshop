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

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\TokenNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;

interface SecurityServiceInterface
{
    /**
     * @throws \InvalidArgumentException
     */
    public function logIn(UserInterface $user): void;

    public function logOut(): void;

    /**
     * @throws TokenNotFoundException
     */
    public function getCurrentToken(): TokenInterface;

    public function restoreToken(TokenInterface $token): void;
}

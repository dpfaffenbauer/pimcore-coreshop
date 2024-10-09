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

namespace CoreShop\Behat\Page\Frontend\Account;

use CoreShop\Bundle\TestBundle\Page\Frontend\AbstractFrontendPage;

class LoginPage extends AbstractFrontendPage implements LoginPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_login';
    }

    public function hasValidationErrorWith(string $message): bool
    {
        return $this->getElement('validation_error')->getText() === $message;
    }

    public function logIn(): void
    {
        $this->getElement('login_button')->click();
    }

    public function specifyPassword(string $password): void
    {
        $this->getElement('password')->setValue($password);
    }

    public function specifyUsername(string $username): void
    {
        $this->getElement('username')->setValue($username);
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'login_button' => '[data-test-login-button]',
            'password' => '[data-test-login-password]',
            'username' => '[data-test-login-username]',
            'validation_error' => '[data-test-flash-message="danger"]',
        ]);
    }
}

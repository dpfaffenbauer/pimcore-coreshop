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

use Behat\Mink\Exception\ElementNotFoundException;
use CoreShop\Bundle\TestBundle\Page\Frontend\AbstractFrontendPage;

class ChangePasswordPage extends AbstractFrontendPage implements ChangePasswordPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_customer_change_password';
    }

    public function checkValidationMessageFor(string $element, string $message): bool
    {
        $errorLabel = $this->getElement($element)->getParent()->find('css', '[data-test-validation-error]');

        if (null === $errorLabel) {
            throw new ElementNotFoundException($this->getSession(), 'Validation message', 'css', '[data-test-validation-error]');
        }

        return $message === $errorLabel->getText();
    }

    public function specifyCurrentPassword(string $password): void
    {
        $this->getElement('current_password')->setValue($password);
    }

    public function specifyNewPassword(string $password): void
    {
        $this->getElement('new_password')->setValue($password);
    }

    public function specifyConfirmationPassword(string $password): void
    {
        $this->getElement('confirmation')->setValue($password);
    }

    public function save(): void
    {
        $this->getElement('save_changes')->click();
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'save_changes' => '[data-test-save-changes]',
            'confirmation' => '[data-test-confirmation-new-password]',
            'current_password' => '[data-test-current-password]',
            'new_password' => '[data-test-new-password]',
        ]);
    }
}

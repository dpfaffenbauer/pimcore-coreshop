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
use CoreShop\Bundle\TestBundle\Page\Frontend\FrontendPageInterface;

interface ChangeProfilePageInterface extends FrontendPageInterface
{
    public function specifyFirstname(?string $firstname = null): void;

    public function specifyLastname(?string $lastname = null): void;

    public function specifyEmail(?string $email = null): void;

    public function specifyConfirmationEmail(?string $email = null): void;

    public function save(): void;

    /**
     * @throws ElementNotFoundException
     */
    public function checkValidationMessageFor(string $element, string $message): bool;
}

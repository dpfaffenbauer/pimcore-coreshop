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

use CoreShop\Bundle\TestBundle\Page\Frontend\FrontendPageInterface;

interface ChangeAddressPageInterface extends FrontendPageInterface
{
    public function getRouteName(): string;

    public function checkValidationMessageFor(string $element, string $message): bool;

    public function specifyFirstname(?string $firstname = null): void;

    public function openLink(?string $street): void;

    public function specifyLastname(?string $lastname = null): void;

    public function specifyStreet(?string $street = null, $number = null): void;

    public function specifyPhoneNumber(string $phoneNumber): void;

    public function deleteAddress($street): void;

    public function save(): void;

    public function addAddress(): void;

    public function fillAddress($country = null, $city = null, $postcode = null, $number = null, $street = null, $firstname = null, $lastname = null, $salutation = null, $phone = null): void;
}

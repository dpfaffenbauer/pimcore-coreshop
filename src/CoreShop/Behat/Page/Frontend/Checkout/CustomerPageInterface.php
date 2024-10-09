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

namespace CoreShop\Behat\Page\Frontend\Checkout;

use CoreShop\Bundle\TestBundle\Page\Frontend\FrontendPageInterface;

interface CustomerPageInterface extends FrontendPageInterface
{
    public function specifyGuestGender(?string $gender): void;

    public function specifyGuestFirstname(?string $firstname): void;

    public function specifyGuestLastname(?string $lastname): void;

    public function specifyGuestEmail(?string $email): void;

    public function specifyGuestEmailRepeat(?string $email): void;

    public function specifyGuestAddressCompany(?string $company): void;

    public function specifyGuestAddressSalutation(?string $salutation): void;

    public function specifyGuestAddressFirstname(?string $firstname): void;

    public function specifyGuestAddressLastname(?string $lastname): void;

    public function specifyGuestAddressStreet(?string $street): void;

    public function specifyGuestAddressNumber(?string $number): void;

    public function specifyGuestAddressPostcode(?string $postcode): void;

    public function specifyGuestAddressCity(?string $city): void;

    public function specifyGuestAddressPhoneNumber(?string $number): void;

    public function specifyGuestAddressCountry(?int $country): void;

    public function acceptTermsOfService(): void;

    public function submitGuestCheckout(): void;
}

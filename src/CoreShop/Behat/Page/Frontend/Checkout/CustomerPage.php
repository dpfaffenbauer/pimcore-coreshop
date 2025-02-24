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

use CoreShop\Bundle\TestBundle\Page\Frontend\AbstractFrontendPage;

class CustomerPage extends AbstractFrontendPage implements CustomerPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_checkout';
    }

    protected function getAdditionalParameters(): array
    {
        return [
            'stepIdentifier' => 'customer',
        ];
    }

    public function specifyGuestGender(?string $gender): void
    {
        $this->getElement('gender')->setValue($gender);
    }

    public function specifyGuestFirstname(?string $firstname): void
    {
        $this->getElement('firstname')->setValue($firstname);
    }

    public function specifyGuestLastname(?string $lastname): void
    {
        $this->getElement('lastname')->setValue($lastname);
    }

    public function specifyGuestEmail(?string $email): void
    {
        $this->getElement('email')->setValue($email);
    }

    public function specifyGuestEmailRepeat(?string $email): void
    {
        $this->getElement('email_verification')->setValue($email);
    }

    public function specifyGuestAddressCompany(?string $company): void
    {
        $this->getElement('address_company')->setValue($company);
    }

    public function specifyGuestAddressSalutation(?string $salutation): void
    {
        $this->getElement('address_salutation')->setValue($salutation);
    }

    public function specifyGuestAddressFirstname(?string $firstname): void
    {
        $this->getElement('address_firstname')->setValue($firstname);
    }

    public function specifyGuestAddressLastname(?string $lastname): void
    {
        $this->getElement('address_lastname')->setValue($lastname);
    }

    public function specifyGuestAddressStreet(?string $street): void
    {
        $this->getElement('address_street')->setValue($street);
    }

    public function specifyGuestAddressNumber(?string $number): void
    {
        $this->getElement('address_number')->setValue($number);
    }

    public function specifyGuestAddressPostcode(?string $postcode): void
    {
        $this->getElement('address_postcode')->setValue($postcode);
    }

    public function specifyGuestAddressCity(?string $city): void
    {
        $this->getElement('address_city')->setValue($city);
    }

    public function specifyGuestAddressPhoneNumber(?string $number): void
    {
        $this->getElement('address_phone_number')->setValue($number);
    }

    public function specifyGuestAddressCountry(?int $country): void
    {
        $this->getElement('address_country')->setValue($country);
    }

    public function acceptTermsOfService(): void
    {
        $this->getElement('terms_of_service')->click();
    }

    public function submitGuestCheckout(): void
    {
        $this->getElement('guest_submit')->press();
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'gender' => '[data-test-guest-gender]',
            'firstname' => '[data-test-guest-firstname]',
            'lastname' => '[data-test-guest-lastname]',
            'email' => '[data-test-guest-email-first]',
            'email_verification' => '[data-test-guest-email-second]',
            'password' => '[data-test-guest-password-first]',
            'password_verification' => '[data-test-guest-password-second]',
            'newsletter_active' => '[data-test-guest-newsletter-active]',

            'address_company' => '[data-test-guest-address-company]',
            'address_salutation' => '[data-test-guest-address-salutation]',
            'address_firstname' => '[data-test-guest-address-firstname]',
            'address_lastname' => '[data-test-guest-address-lastname]',
            'address_street' => '[data-test-guest-address-street]',
            'address_number' => '[data-test-guest-address-number]',
            'address_postcode' => '[data-test-guest-address-post-code]',
            'address_city' => '[data-test-guest-address-city]',
            'address_country' => '[data-test-guest-address-country]',
            'address_phone_number' => '[data-test-guest-address-phone-number]',

            'terms_of_service' => '[data-test-guest-terms]',
            'guest_submit' => '[data-test-guest-button]',
        ]);
    }
}

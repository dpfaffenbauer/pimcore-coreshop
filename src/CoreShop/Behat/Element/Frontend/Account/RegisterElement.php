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

namespace CoreShop\Behat\Element\Frontend\Account;

use Behat\Mink\Exception\ElementNotFoundException;
use FriendsOfBehat\PageObjectExtension\Element\Element;

final class RegisterElement extends Element implements RegisterElementInterface
{
    /**
     * @throws ElementNotFoundException
     */
    public function checkValidationMessageFor(string $element, string $message): bool
    {
        $errorLabel = $this
            ->getElement(str_replace([' ', '-', '\''], '_', $element))
            ->getParent()
            ->find('css', '[data-test-validation-error]')
        ;

        if (null === $errorLabel) {
            throw new ElementNotFoundException($this->getSession(), 'Validation message', 'css', '[data-test-validation-error]');
        }

        return $message === $errorLabel->getText();
    }

    public function register(): void
    {
        $this->getElement('create_account_button')->press();
    }

    public function getEmail(): string
    {
        return $this->getElement('email')->getValue();
    }

    public function specifySalutation(?string $salutation): void
    {
        $this->getElement('salutation')->setValue($salutation);
    }

    public function specifyGender(?string $gender): void
    {
        $this->getElement('gender')->setValue($gender);
    }

    public function specifyFirstname(?string $firstName): void
    {
        $this->getElement('firstname')->setValue($firstName);
    }

    public function specifyLastname(?string $lastName): void
    {
        $this->getElement('lastname')->setValue($lastName);
    }

    public function specifyEmail(?string $email): void
    {
        $this->getElement('email')->setValue($email);
    }

    public function verifyEmail(?string $email): void
    {
        $this->getElement('email_verification')->setValue($email);
    }

    public function specifyPassword(?string $password): void
    {
        $this->getElement('password')->setValue($password);
    }

    public function verifyPassword(?string $password): void
    {
        $this->getElement('password_verification')->setValue($password);
    }

    public function subscribeToTheNewsletter(): void
    {
        $this->getElement('newsletter_active')->check();
    }

    public function specifyAddressCompany(?string $company): void
    {
        $this->getElement('address_company')->setValue($company);
    }

    public function specifyAddressSalutation(?string $salutation): void
    {
        $this->getElement('address_salutation')->setValue($salutation);
    }

    public function specifyAddressFirstname(?string $firstName): void
    {
        $this->getElement('address_firstname')->setValue($firstName);
    }

    public function specifyAddressLastname(?string $lastname): void
    {
        $this->getElement('address_lastname')->setValue($lastname);
    }

    public function specifyAddressStreet(?string $street): void
    {
        $this->getElement('address_street')->setValue($street);
    }

    public function specifyAddressNumber(?string $number): void
    {
        $this->getElement('address_number')->setValue($number);
    }

    public function specifyAddressPostcode(?string $postcode): void
    {
        $this->getElement('address_postcode')->setValue($postcode);
    }

    public function specifyAddressCity(?string $city): void
    {
        $this->getElement('address_city')->setValue($city);
    }

    public function specifyAddressCountry(?int $country): void
    {
        $this->getElement('address_country')->setValue($country);
    }

    public function specifyAddressPhoneNumber(?string $phoneNumber): void
    {
        $this->getElement('address_phone_number')->setValue($phoneNumber);
    }

    public function acceptTermsOfService(): void
    {
        $this->getElement('terms_of_service')->click();
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'create_account_button' => '[data-test-register-button]',

            'salutation' => '[data-test-register-salutation]',
            'gender' => '[data-test-register-gender]',
            'firstname' => '[data-test-register-firstname]',
            'lastname' => '[data-test-register-lastname]',
            'email' => '[data-test-register-email-first]',
            'email_verification' => '[data-test-register-email-second]',
            'password' => '[data-test-register-password-first]',
            'password_verification' => '[data-test-register-password-second]',
            'newsletter_active' => '[data-test-register-newsletter-active]',

            'address_company' => '[data-test-register-address-company]',
            'address_salutation' => '[data-test-register-address-salutation]',
            'address_firstname' => '[data-test-register-address-firstname]',
            'address_lastname' => '[data-test-register-address-lastname]',
            'address_street' => '[data-test-register-address-street]',
            'address_number' => '[data-test-register-address-number]',
            'address_postcode' => '[data-test-register-address-post-code]',
            'address_city' => '[data-test-register-address-city]',
            'address_country' => '[data-test-register-address-country]',
            'address_phone_number' => '[data-test-register-address-phone-number]',

            'terms_of_service' => '[data-test-register-terms]',
        ]);
    }
}

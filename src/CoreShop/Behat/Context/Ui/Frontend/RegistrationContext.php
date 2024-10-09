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

namespace CoreShop\Behat\Context\Ui\Frontend;

use Behat\Behat\Context\Context;
use CoreShop\Behat\Element\Frontend\Account\RegisterElementInterface;
use CoreShop\Behat\Page\Frontend\Account\LoginPageInterface;
use CoreShop\Behat\Page\Frontend\Account\RegisterPageInterface;
use CoreShop\Behat\Page\Frontend\HomePageInterface;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use Webmozart\Assert\Assert;

class RegistrationContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private HomePageInterface $homePage,
        private LoginPageInterface $loginPage,
        private RegisterPageInterface $registerPage,
        private RegisterElementInterface $registerElement,
    ) {
    }

    /**
     * @When /^I want to(?:| again) register a new account$/
     */
    public function iWantToRegisterANewAccount(): void
    {
        $this->registerPage->open();
    }

    /**
     * @When I specify the salutation as :salutation
     * @When I do not specify the salutation
     */
    public function iSpecifyTheSalutation(?string $salutation = null): void
    {
        $this->registerElement->specifySalutation($salutation);
    }

    /**
     * @When I specify the gender as :gender
     * @When I do not specify the gender
     */
    public function iSpecifyTheGender(?string $gender = null): void
    {
        $this->registerElement->specifyGender($gender);
    }

    /**
     * @When I specify the first name as :firstname
     * @When I do not specify the first name
     */
    public function iSpecifyTheFirstName(?string $firstname = null): void
    {
        $this->registerElement->specifyFirstName($firstname);
    }

    /**
     * @When I specify the last name as :lastname
     * @When I do not specify the last name
     */
    public function iSpecifyTheLastName(?string $lastname = null): void
    {
        $this->registerElement->specifyLastName($lastname);
    }

    /**
     * @When I specify the email as :email
     * @When I do not specify the email
     */
    public function iSpecifyTheEmail(?string $email = null): void
    {
        $this->registerElement->specifyEmail($email);
        $this->sharedStorage->set('email', $email);
    }

    /**
     * @When /^I confirm (this email)$/
     */
    public function iConfirmThisEmail(string $email): void
    {
        $this->registerElement->verifyEmail($email);
    }

    /**
     * @When I specify the password as :password
     * @When I do not specify the password
     */
    public function iSpecifyThePasswordAs(?string $password = null): void
    {
        $this->registerElement->specifyPassword($password);
        $this->sharedStorage->set('password', $password);
    }

    /**
     * @When /^I confirm (this password)$/
     */
    public function iConfirmThisPassword(string $password): void
    {
        $this->registerElement->verifyPassword($password);
    }

    /**
     * @Given I do not confirm the password
     */
    public function iDoNotConfirmPassword(): void
    {
        $this->registerElement->verifyPassword(null);
    }

    /**
     * @When I specify the address company as :company
     * @When I do not specify the address company
     */
    public function iSpecifyTheAddressCompany(?string $company = null): void
    {
        $this->registerElement->specifyAddressCompany($company);
    }

    /**
     * @When I specify the address salutation as :salutation
     * @When I do not specify the address salutation
     */
    public function iSpecifyTheAddressSalutation(?string $salutation = null): void
    {
        $this->registerElement->specifyAddressSalutation($salutation);
    }

    /**
     * @When I specify the address first name as :firstname
     * @When I do not specify the address first name
     */
    public function iSpecifyTheAddressFirstname(?string $firstname = null): void
    {
        $this->registerElement->specifyAddressFirstname($firstname);
    }

    /**
     * @When I specify the address last name as :lastname
     * @When I do not specify the address last name
     */
    public function iSpecifyTheAddressLastname(?string $lastname = null): void
    {
        $this->registerElement->specifyAddressLastname($lastname);
    }

    /**
     * @When I specify the address street as :street
     * @When I do not specify the address street
     */
    public function iSpecifyTheAddressStreet(?string $street = null): void
    {
        $this->registerElement->specifyAddressStreet($street);
    }

    /**
     * @When I specify the address number as :number
     * @When I do not specify the address number
     */
    public function iSpecifyTheAddressNumber(?string $number = null): void
    {
        $this->registerElement->specifyAddressNumber($number);
    }

    /**
     * @When I specify the address post code as :postCode
     * @When I do not specify the address post code
     */
    public function iSpecifyTheAddressPostCode(?string $postCode = null): void
    {
        $this->registerElement->specifyAddressPostcode($postCode);
    }

    /**
     * @When I specify the address city as :city
     * @When I do not specify the address city
     */
    public function iSpecifyTheAddressCity(?string $city = null): void
    {
        $this->registerElement->specifyAddressCity($city);
    }

    /**
     * @Given /^I specify the address country as (country "[^"]+")$/
     *
     * @When I do not specify the address country
     */
    public function iSpecifyTheAddressCountry(?CountryInterface $country = null): void
    {
        $this->registerElement->specifyAddressCountry($country ? $country->getId() : null);
    }

    /**
     * @When I specify the address phone number as :phoneNumber
     * @When I do not specify the address phone number
     */
    public function iSpecifyTheAddressPhoneNumber(?string $phoneNumber = null): void
    {
        $this->registerElement->specifyAddressPhoneNumber($phoneNumber);
    }

    /**
     * @When I accept the terms of service
     */
    public function IAcceptTheTermsOfService(): void
    {
        $this->registerElement->acceptTermsOfService();
    }

    /**
     * @When I register this account
     * @When I try to register this account
     */
    public function iRegisterThisAccount(): void
    {
        $this->registerElement->register();
    }

    /**
     * @Then /^I should be notified that the ([^"]+) is required$/
     */
    public function iShouldBeNotifiedThatElementIsRequired(string $element): void
    {
        $this->assertFieldValidationMessage($element, 'This value should not be blank.');
    }

    /**
     * @Then I should be notified that the email is already used
     */
    public function iShouldBeNotifiedThatTheEmailIsAlreadyUsed(): void
    {
        $this->assertFieldValidationMessage('email', 'This email is already used.');
    }

    /**
     * @Then I should be notified that the password do not match
     */
    public function iShouldBeNotifiedThatThePasswordDoNotMatch(): void
    {
        $this->assertFieldValidationMessage('password', 'The password fields must match.');
    }

    /**
     * @Then I should be logged in
     */
    public function iShouldBeLoggedIn(): void
    {
        Assert::true($this->homePage->hasLogoutButton());
    }

    /**
     * @Then I should not be logged in
     */
    public function iShouldNotBeLoggedIn(): void
    {
        Assert::false($this->homePage->hasLogoutButton());
    }

    /**
     * @Then I should be able to log in as :email with :password password
     */
    public function iShouldBeAbleToLogInAsWithPassword(string $email, string $password): void
    {
        $this->iLogInAsWithPassword($email, $password);
        $this->iShouldBeLoggedIn();
    }

    /**
     * @Then I should not be able to log in as :email with :password password
     */
    public function iShouldNotBeAbleToLogInAsWithPassword(string $email, string $password): void
    {
        $this->iLogInAsWithPassword($email, $password);

        Assert::true($this->loginPage->hasValidationErrorWith('Error Account is disabled.'));
    }

    /**
     * @When I log in as :email with :password password
     */
    public function iLogInAsWithPassword(string $email, string $password): void
    {
        $this->loginPage->open();
        $this->loginPage->specifyUsername($email);
        $this->loginPage->specifyPassword($password);
        $this->loginPage->logIn();
    }

    /**
     * @When I register with email :email and password :password
     * @When I register with email :email and password :password in the :localeCode locale
     */
    public function iRegisterWithEmailAndPassword(string $email, string $password, string $localeCode = 'en'): void
    {
        $this->registerPage->open(['_locale' => $localeCode]);
        $this->registerElement->specifyEmail($email);
        $this->registerElement->verifyEmail($email);
        $this->registerElement->specifyPassword($password);
        $this->registerElement->verifyPassword($password);
        $this->registerElement->specifyFirstName('Carrot');
        $this->registerElement->specifyLastName('Ironfoundersson');
        $this->registerElement->specifyAddressFirstname('Carrot');
        $this->registerElement->specifyAddressLastname('Ironfoundersson');
        $this->registerElement->specifyAddressCity('Vienna');
        $this->registerElement->specifyAddressStreet('Ring');
        $this->registerElement->specifyAddressNumber('1');
        $this->registerElement->specifyAddressPostcode('1010');
        $this->registerElement->acceptTermsOfService();
        $this->registerElement->register();
    }

    /**
     * @When I subscribe to the newsletter
     */
    public function iSubscribeToTheNewsletter(): void
    {
        $this->registerElement->subscribeToTheNewsletter();
    }

    private function assertFieldValidationMessage(string $element, string $expectedMessage): void
    {
        Assert::true($this->registerElement->checkValidationMessageFor($element, $expectedMessage));
    }
}

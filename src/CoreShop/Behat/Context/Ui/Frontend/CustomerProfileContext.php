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
use CoreShop\Behat\Page\Frontend\Account\ChangeAddressPageInterface;
use CoreShop\Behat\Page\Frontend\Account\ChangePasswordPageInterface;
use CoreShop\Behat\Page\Frontend\Account\ChangeProfilePageInterface;
use CoreShop\Behat\Page\Frontend\Account\ProfilePageInterface;
use CoreShop\Bundle\TestBundle\Service\NotificationCheckerInterface;
use CoreShop\Bundle\TestBundle\Service\NotificationType;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Webmozart\Assert\Assert;

class CustomerProfileContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ChangePasswordPageInterface $changePasswordPage,
        private ProfilePageInterface $profilePage,
        private ChangeProfilePageInterface $changeProfilePage,
        private NotificationCheckerInterface $notificationChecker,
        private ChangeAddressPageInterface $changeAddressPage,
    ) {
    }

    /**
     * @Given /^I want to change my password$/
     */
    public function iWantToChangeMyPassword(): void
    {
        $this->changePasswordPage->open();
    }

    /**
     * @Given I change password from :oldPassword to :newPassword
     */
    public function iChangePasswordTo($oldPassword, $newPassword): void
    {
        $this->iSpecifyTheCurrentPasswordAs($oldPassword);
        $this->iSpecifyTheNewPasswordAs($newPassword);
        $this->iSpecifyTheConfirmationPasswordAs($newPassword);
    }

    /**
     * @Then I should be notified that my password has been successfully changed
     */
    public function iShouldBeNotifiedThatMyPasswordHasBeenSuccessfullyChanged(): void
    {
        $this->notificationChecker->checkNotification('Password has been successfully changed', NotificationType::success());
    }

    /**
     * @Given I specify the current password as :password
     */
    public function iSpecifyTheCurrentPasswordAs($password): void
    {
        $this->changePasswordPage->specifyCurrentPassword($password);
    }

    /**
     * @Given I specify the new password as :password
     */
    public function iSpecifyTheNewPasswordAs($password): void
    {
        $this->changePasswordPage->specifyNewPassword($password);
    }

    /**
     * @Given I confirm this password as :password
     */
    public function iSpecifyTheConfirmationPasswordAs($password): void
    {
        $this->changePasswordPage->specifyConfirmationPassword($password);
    }

    /**
     * @When I save my new password
     */
    public function iSaveMyChanges(): void
    {
        $this->changePasswordPage->save();
    }

    /**
     * @Then I should be notified that the entered passwords do not match
     */
    public function iShouldBeNotifiedThatTheEnteredPasswordsDoNotMatch(): void
    {
        Assert::true($this->changePasswordPage->checkValidationMessageFor(
            'new_password',
            'The password fields must match.',
        ));
    }

    /**
     * @Then I should be notified that provided password is different than the current one
     */
    public function iShouldBeNotifiedThatProvidedPasswordIsDifferentThanTheCurrentOne(): void
    {
        Assert::true($this->changePasswordPage->checkValidationMessageFor(
            'current_password',
            'This value should be the user\'s current password.',
        ));
    }

    /**
     * @Then my name should be :name
     * @Then my name should still be :name
     */
    public function myNameShouldBe($name): void
    {
        $this->profilePage->open();

        Assert::true($this->profilePage->hasCustomerName($name));
    }

    /**
     * @Then my email should be :email
     * @Then my email should still be :email
     */
    public function myEmailShouldBe($email): void
    {
        $this->profilePage->open();

        Assert::true($this->profilePage->hasCustomerEmail($email));
    }

    /**
     * @When /^I want to change my personal information$/
     */
    public function iWantToChangeMyPersonalInformation(): void
    {
        $this->changeProfilePage->open();
    }

    /**
     * @When I specify the new first name as :firstname
     * @When I remove the first name
     */
    public function iSpecifyTheNewFirstnameAs(?string $firstname = null): void
    {
        $this->changeProfilePage->specifyFirstname($firstname);
    }

    /**
     * @When I specify the new last name as :lastname
     * @When I remove the last name
     */
    public function iSpecifyTheNewLastnameAs(?string $lastname = null): void
    {
        $this->changeProfilePage->specifyLastname($lastname);
    }

    /**
     * @When I specify the new email as :email
     * @When I remove the email
     */
    public function iSpecifiyTheNewEmailAs(?string $email = null): void
    {
        $this->changeProfilePage->specifyEmail($email);

        $this->sharedStorage->set('email', $email);
    }

    /**
     * @When /^I confirm (this email)$/
     * @When I confirm email as :email
     * @When /^I also remove the confirm email$/
     */
    public function iConfirmThisEmail(?string $email = null): void
    {
        $this->changeProfilePage->specifyConfirmationEmail($email);
    }

    /**
     * @Given I save my personal information
     */
    public function iSaveMyPersonalInformation(): void
    {
        $this->changeProfilePage->save();
    }

    /**
     * @Then /^I should be notified that the ([^"]+) is required$/
     */
    public function iShouldBeNotifiedThatElementIsRequired(string $element): void
    {
        Assert::true($this->changeProfilePage->checkValidationMessageFor(
            $element,
            'This value should not be blank.',
        ));
    }

    /**
     * @Then /^I should be notified that the ([^"]+) is invalid$/
     */
    public function iShouldBeNotifiedThatElementIsInvalid(string $element): void
    {
        Assert::true($this->changeProfilePage->checkValidationMessageFor(
            $element,
            'This value is not a valid email address.',
        ));
    }

    /**
     * @Then /^I should be notified that the ([^"]+) does not match$/
     */
    public function iShouldBeNotifiedThatThePasswordDoNotMatch(string $element): void
    {
        Assert::true($this->changeProfilePage->checkValidationMessageFor(
            $element,
            sprintf('The %s fields must match.', $element),
        ));
    }

    /**
     * @Then I should be notified that the email is already used
     */
    public function iShouldBeNotifiedThatTheEmailIsAlreadyUsed(): void
    {
        Assert::true($this->changeProfilePage->checkValidationMessageFor(
            'email',
            'This email is already used.',
        ));
    }

    /**
     * @When /^I choose "([^"]+)" to edit$/
     */
    public function iWantToChangeMyAddressInformation($street): void
    {
        $this->changeAddressPage->openLink($street);
    }

    /**
     * @When /^I open my addresses$/
     */
    public function iOpenMyAddresses(): void
    {
        $this->changeAddressPage->open();
    }

    /**
     * @Given I change my street to :street and number :number
     */
    public function iChangeStreetTo($street, $number): void
    {
        $this->changeAddressPage->specifyStreet($street, $number);
    }

    /**
     * @Given I save my address
     */
    public function iSaveAddress(): void
    {
        $this->changeAddressPage->save();
    }

    /**
     * @When I want to add a address information
     */
    public function addAddress(): void
    {
        $this->changeAddressPage->open();
        $this->changeAddressPage->addAddress();
    }

    /**
     * @When /^my new Address is "([^"]+)", "([^"]+)", (country "[^"]+"), "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"$/
     */
    public function addAddressInfo($firstname, $lastname, $country, $postcode, $city, $street, $number, $phone): void
    {
        $this->changeAddressPage->fillAddress($country, $city, $postcode, $number, $street, $firstname, $lastname, $phone);
    }

    /**
     * @When /^I want to delete my address with street "([^"]+)"$/
     */
    public function iWantToDeleteAddress($street): void
    {
        $this->changeAddressPage->deleteAddress($street);
    }
}

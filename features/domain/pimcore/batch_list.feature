@domain @pimcore
Feature: Using the CoreShop Batch List
    In order to use the CoreShop Batch List
    I want to create a new Pimcore Class and
    iterate over all objects with the CoreShop Batch List

  Background:
    Given there is a pimcore class "Test"
    And the definition has a checkbox field "enabled"
    And the definition has a localized input field "name"
    And the definitions parent class is set to "\CoreShop\Behat\Model\Index\TestEnableIndex"
    And there are 20 instances of behat-class "Test" with key-prefix "test"

  Scenario: Iterate the Class with Batch Listing
    Then iterating the behat-class "Test" should return 20 objects

  Scenario: Iterate the Class with Batch Listing with a offset
    Then iterating the behat-class "Test" with a offset of 5 should return 15 objects

  Scenario: Iterate the Class with Batch Listing with a offset and limit
    Then iterating the behat-class "Test" with a offset of 5 and limit of 1 should return 1 objects
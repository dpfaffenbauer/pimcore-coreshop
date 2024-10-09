@domain @pimcore
Feature: Adding a new pimcore Class

  Scenario: Create a new pimcore class
    Given there is a pimcore class "Car"
    And the definitions parent class is set to "\CoreShop\Behat\Model\Car"
    And the class "Car" is registered as Pimcore Resource

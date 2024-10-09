@ui @cart
Feature: Create a new multi-cart

  Background:
    Given the site operates on a store in "Austria"
    And the store "Austria" is the default store
    And I am a logged in customer

  Scenario: I create a new cart
    When I create a new named cart "Project XY"
    Then I should be notified that the cart was created

  Scenario: I create multiple new carts
    When I create a new named cart "Project XY"
    When I create a new named cart "Project ZU"
    When I create a new named cart "Project YI"
    When I create a new named cart "Project Studio"
    Then I should be notified that the cart was created
    And The cart named "Project Studio" should be selected

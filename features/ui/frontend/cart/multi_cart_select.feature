@ui @cart
Feature: Create a new multi-cart and change selection

  Background:
    Given the site operates on a store in "Austria"
    And the store "Austria" is the default store
    And I am a logged in customer
    And the site has a product "TShirt" priced at 10000
    And the product is active and published and available for store "Austria"
    And the site has a product "Cup" priced at 123456
    And the product is active and published and available for store "Austria"

  Scenario: I create multiple new carts and select between them
    When I create a new named cart "Project CoreShop"
    When I create a new named cart "Project Commerce"
    When I create a new named cart "Project Studio"
    And The cart named "Project Studio" should be selected
    Then I select named cart "Project CoreShop"
    And The cart named "Project CoreShop" should be selected
    Then I select named cart "Project Commerce"
    And The cart named "Project Commerce" should be selected

  Scenario: I create multiple new carts, select between them and add products
    When I create a new named cart "Project CoreShop"
    And I create a new named cart "Project Commerce"
    And I create a new named cart "Project Studio"
    Then I select named cart "Project Commerce"
    And I add product "TShirt" to the cart
    And I add product "Cup" to the cart
    Then I select named cart "Project CoreShop"
    And I add product "TShirt" to the cart
    Then I select named cart "Project Studio"
    And I add product "Cup" to the cart
    Then Cart with name "Project CoreShop" should have total of "€100.00"
    And Cart with name "Project Studio" should have total of "€1,234.56"
    And Cart with name "Project Commerce" should have total of "€1,334.56"

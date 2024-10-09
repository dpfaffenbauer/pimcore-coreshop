@ui @cart
Feature: Create a new multi-cart and add items to different carts

  Background:
    Given the site operates on a store in "Austria"
    And the store "Austria" is the default store
    And I am a logged in customer
    And the site has a product "TShirt" priced at 10000
    And the product is active and published and available for store "Austria"

  Scenario: I create a new cart and add items
    When I create a new named cart "Project XY"
    And I add this product to the cart
    Then I should be on the cart summary page
    And I should be notified that the product has been successfully added
    And there should be one item in my cart
    And Cart with name "Project XY" should have total of "€100.00"

  Scenario: I create multiple new carts and add items
    When I create a new named cart "Project XY"
    And I add this product to the cart
    And there should be one item in my cart
    When I create a new named cart "Project Studio"
    And I add this product to the cart
    Then there should be one item in my cart
    And Cart with name "Project XY" should have total of "€100.00"
    And Cart with name "Project Studio" should have total of "€100.00"

  Scenario: I don't create a cart and use the default cart
    When I add this product to the cart
    And there should be one item in my cart
    And Cart with name "My Cart" should have total of "€100.00"

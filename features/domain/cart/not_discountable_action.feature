@domain @cart
Feature: Adding a not discountable attribute to the cart item
  In order to allow custom order-item attributes based on pricing rules
  we add a not-discountable attribute to the cart item

  Background:
    Given the site operates on a store in "Austria"
    And the site has a currency "Euro" with iso "EUR"
    And I am in country "Austria"
    And the site has two categories "Shoes" and "Coats"
    And the site has a product "Shoe" priced at 10000
    And it is in category "Shoes"

  Scenario: Adding no not-discountable price rule
    Given  I add the product "Shoe" to my cart
    Then the cart item with product should not have a custom attribute named "not_discountable"

  Scenario: Adding a not-discountable price rule
    Given adding a product price rule named "not-discountable"
    And the price rule is active
    And the price rule has a action not-discountable
    And  I add the product "Shoe" to my cart
    Then the cart item with product should have a custom attribute named "not_discountable"

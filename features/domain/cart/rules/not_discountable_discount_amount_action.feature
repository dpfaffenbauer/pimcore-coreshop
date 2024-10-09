@domain @cart
Feature: Adding a new cart rule
  In order to give the customer discounts
  based on the cart, we add a new rule

  Background:
    Given the site operates on a store in "Austria"
    And the site has a currency "Euro" with iso "EUR"
    And I am in country "Austria"
    And the site has a product "Shoe" priced at 10000
    And adding a product price rule named "not-discountable"
    And the price rule is active
    And the price rule has a action not-discountable
    And I add the product "Shoe" to my cart

  Scenario: Add a new discount rule with 20 percent discount for all products
    Given adding a cart price rule named "discount"
    And the cart rule is active
    And the cart rule is a voucher rule with code "asdf"
    And the cart rule has a action discount with 20 in currency "EUR" off
    And I apply the voucher code "asdf" to my cart
    Then the cart discount should be "0" including tax
    Then the cart total should be "10000" including tax


@domain @cart
Feature: Adding a new cart rule
  In order to give the customer discounts
  based on the cart, we add a new rule

  Background:
    Given the site operates on a store in "Austria"
    And the site has a currency "Euro" with iso "EUR"
    And I am in country "Austria"
    And the site has two categories "Shoes" and "Coats"
    And the site has a product "Shoe" priced at 10000
    And it is in category "Shoes"
    And adding a product specific price rule to product "Shoe" named "not-discountable"
    And the specific price rule is active
    And the specific price rule has a action not-discountable
    And the site has a product "Jacket" priced at 40000
    And it is in category "Coats"
    And I add the product "Shoe" to my cart
    And I add the product "Jacket" to my cart

  Scenario: Add a new discount rule with 20 percent discount for all products
    Given adding a cart price rule named "discount"
    And the cart rule is active
    And the cart rule is a voucher rule with code "asdf"
    And the cart rule has a action discount-percent with 10% discount
    And I apply the voucher code "asdf" to my cart
    Then the cart discount should be "-5000" including tax
    Then the cart total should be "45000" including tax

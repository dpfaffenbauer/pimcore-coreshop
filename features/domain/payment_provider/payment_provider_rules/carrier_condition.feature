@domain @payment_provider
Feature: Adding a new Payment Provider Rule
  In order to payment costs
  I'll create a new payment-provider-rule
  with an carrier condition

  Background:
    Given the site operates on a store in "Austria"
    And the site has a currency "Euro" with iso "EUR"
    And I am in country "Austria"
    And the site has a product "Shoe" priced at 10000
    And I add the product "Shoe" to my cart
    And There is a payment provider "Bankwire" using factory "Bankwire"
    And the site has a carrier "Post"
    And the carrier "Post" is enabled for store "Austria"
    And my cart uses carrier "Post"

  Scenario: Add a new carrier payment-provider-rule which is valid
    Given adding a payment-provider-rule named "carriers"
    And the payment-provider-rule is active
    And the payment-provider-rule has a condition carriers with carrier "Post"
    Then the payment-provider-rule should be valid for my cart with payment provider "Bankwire"

  Scenario: Add a new carrier payment-provider-rule which is inactive
    Given adding a payment-provider-rule named "carriers"
    And the payment-provider-rule is inactive
    And the payment-provider-rule has a condition currencies with currency "EUR"
    Then the payment-provider-rule should be invalid for my cart with payment provider "Bankwire"

  Scenario: Add a new carrier payment-provider-rule which is invalid
    Given the site has a carrier "DHL"
    And adding a payment-provider-rule named "carriers"
    And the payment-provider-rule is active
    And the payment-provider-rule has a condition carriers with carrier "DHL"
    Then the payment-provider-rule should be invalid for my cart with payment provider "Bankwire"

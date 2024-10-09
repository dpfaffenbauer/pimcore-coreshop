@domain @order
Feature: Create a new order and add a payment

  Background:
    Given the site operates on a store in "Austria"
    And the site operates on locale "en"
    And the site has a tax rate "AT" with "20%" rate
    And the site has a tax rule group "AT"
    And the tax rule group has a tax rule for country "Austria" with tax rate "AT"
    And the site has a product "T-Shirt" priced at 2000
    And the product has the tax rule group "AT"
    And the site has a customer "some-customer@something.com"
    And the customer "some-customer@something.com" has an address with country "Austria", "4600", "Wels", "Freiung", "9-11/N3"
    And I add the product "T-Shirt" to my cart
    And the cart ships to customer "some-customer@something.com" address with postcode "4600"
    And the cart invoices to customer "some-customer@something.com" address with postcode "4600"
    And the cart belongs to customer "some-customer@something.com"
    And There is a payment provider "Bankwire" using factory "Bankwire"
    And I create an order from my cart

  Scenario: Create failed payment
    Given I create a payment for my order with payment provider "Bankwire" and amount 1800
    And I apply payment transition "fail" to latest order payment
    Then the order payment state should be "awaiting_payment"
    And the order state should be "new"

  Scenario: Create cancelled payment
    Given I create a payment for my order with payment provider "Bankwire" and amount 1800
    And I apply payment transition "cancel" to latest order payment
    Then the order payment state should be "awaiting_payment"
    And the order state should be "new"

  Scenario: Create fully paid payment
    Given I create a payment for my order with payment provider "Bankwire" and amount 2400
    And I apply payment transition "complete" to latest order payment
    Then the order payment state should be "paid"
    And the order state should be "confirmed"

  Scenario: Create partially paid payment
    Given I create a payment for my order with payment provider "Bankwire" and amount 1800
    And I apply payment transition "complete" to latest order payment
    Then the order payment state should be "partially_paid"
    And the order state should be "confirmed"

  Scenario: Create fully authorized payment
    Given I create a payment for my order with payment provider "Bankwire" and amount 2400
    And I apply payment transition "authorize" to latest order payment
    Then the order payment state should be "authorized"
    And the order state should be "confirmed"

  Scenario: Create partially authorized payment
    Given I create a payment for my order with payment provider "Bankwire" and amount 1800
    And I apply payment transition "authorize" to latest order payment
    Then the order payment state should be "partially_authorized"
    And the order state should be "confirmed"

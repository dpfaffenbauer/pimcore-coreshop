@domain @order
Feature: Create a new order and add a invoice

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
    And the cart belongs to customer "some-customer@something.com"
    And the cart ships to customer "some-customer@something.com" address with postcode "4600"
    And the cart invoices to customer "some-customer@something.com" address with postcode "4600"
    And There is a payment provider "Bankwire" using factory "Bankwire"

  Scenario: Create order with payment and shipment which still is new
    Given I create an order from my cart
    And I create a payment for my order with payment provider "Bankwire" and amount 2400
    And I create a shipment for my order
    And I apply order shipment transition "request_shipment" to my order
    And I apply shipment transition "ship" to latest order shipment
    Then the order shipping state should be "shipped"
    And the order payment state should be "awaiting_payment"
    And the order state should be "new"

  Scenario: Create order with payment and shipment which still is completed
    Given I create an order from my cart
    And I create a payment for my order with payment provider "Bankwire" and amount 2400
    And I apply payment transition "complete" to latest order payment
    And I create a shipment for my order
    And I apply order shipment transition "request_shipment" to my order
    And I apply shipment transition "ship" to latest order shipment
    Then the order shipping state should be "shipped"
    And the order payment state should be "paid"
    And the order state should be "complete"

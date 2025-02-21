@ui @ui_domain
Feature: Create a new order
  and run the payment notify and capture parallel

  Background:
    Given the site operates on a store in "Austria"
    And the store "Austria" is the default store
    And the site operates on locale "en"
    And the site has a tax rate "AT" with "20%" rate
    And the site has a tax rule group "AT"
    And the tax rule group has a tax rule for country "Austria" with tax rate "AT"
    And the site has a product "T-Shirt" priced at 2000
    And the product is active and published and available for store "Austria"
    And the product has the tax rule group "AT"
    And the site has a customer "some-customer@something.com"
    And the customer "some-customer@something.com" has an address with country "Austria", "4600", "Wels", "Freiung", "9-11/N3"
    And the cart belongs to customer "some-customer@something.com"
    And I add the product "T-Shirt" to my cart
    And the cart ships to customer "some-customer@something.com" address with postcode "4600"
    And the cart invoices to customer "some-customer@something.com" address with postcode "4600"
    And I create an order from my cart

  Scenario: Create Payment, run notify and capture
    Given There is a payment provider "Bankwire" using factory "concurrency"
    And I create a payment for my order with payment provider "Bankwire"
    Then I simulate the concurrent requests for notify and capture for the latest order payment

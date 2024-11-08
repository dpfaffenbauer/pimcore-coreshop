@ui @cart
Feature: Adding a product to the cart
    Background:
        Given the site operates on a store in "Austria"
        And the store "Austria" is the default store

    Scenario: Adding a simple product to the cart
        Given the site has a product "TShirt" priced at 10000
        And the product is active and published and available for store "Austria"
        When I add this product to the cart
        Then I should be on the cart summary page
        And I should be notified that the product has been successfully added
        And there should be one item in my cart
        And this item should have name "TShirt"
        And I should see "TShirt" with unit price "€100.00" in my cart

    Scenario: Adding a product to the cart as a logged in customer
        Given the site has a customer "elon@musk.com" with password "cybertruck"
        And I am logged in as "elon@musk.com"
        Given the site has a product "Racing Car" priced at 100000
        And the product is active and published and available for store "Austria"
        When I add this product to the cart
        Then I should be on the cart summary page
        And I should be notified that the product has been successfully added
        And there should be one item in my cart
        And this item should have name "Racing Car"
        And I should see "Racing Car" with unit price "€1,000.00" in my cart

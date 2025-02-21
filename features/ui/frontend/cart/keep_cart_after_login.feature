@ui @cart
Feature: Maintaining cart after login

    Background:
        Given the site operates on a store in "Austria"
        And the store "Austria" is the default store
        And the site has a customer "elon@musk.com" with password "cybertruck"
        And the site has a product "TShirt" priced at 10000
        And the product is active and published and available for store "Austria"

    Scenario: Having cart maintained after logging in
        Given I add this product to the cart
        When I log in as "elon@musk.com" with "cybertruck" password
        And I see the summary of my cart
        Then there should be one item in my cart
        And this item should have name "TShirt"

    Scenario: Having cart maintained after registration
        Given I add this product to the cart
        When I register with email "elon@spacex.com" and password "bigbigbooster"
        And I see the summary of my cart
        Then there should be one item in my cart
        And this item should have name "TShirt"

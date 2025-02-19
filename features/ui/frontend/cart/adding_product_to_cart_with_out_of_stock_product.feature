@ui @cart
Feature: Adding a product to the cart with a Product that is tracked and out-of-stock

    Background:
        Given the site operates on a store in "Austria"
        And the store "Austria" is the default store
        And the site has a product "TShirt" priced at 10000
        And the product is active and published and available for store "Austria"
        And the product is stock tracked
        And the product has 2 on hand
        And the product has 0 on hold

    Scenario: Adding product to cart with enough quantity left
        When I add 2 of this product to the cart
        Then I should be on the cart summary page
        And I should be notified that the product has been successfully added
        And there should be one item in my cart
        And this item should have name "TShirt"
        And I should see "TShirt" with unit price "€100.00" in my cart

    Scenario: Adding product to cart with more than stocked quantity
        When I add 3 of this product to the cart
        Then I should be on the cart summary page
        And  I should be notified that TShirt does not have sufficient stock

    Scenario: Adding product, with on-hold stock, to cart with more than stocked quantity
        Given the product has 2 on hold
        Then I should see that this product is out of stock

    Scenario: Adding product, with on-hold stock, to cart with enough quantity
        Given the product has 1 on hold
        When I add 2 of this product to the cart
        Then I should be on the cart summary page
        And I should be notified that TShirt does not have sufficient stock


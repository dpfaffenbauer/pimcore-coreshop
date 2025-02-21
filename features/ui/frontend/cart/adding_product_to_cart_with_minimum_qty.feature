@ui @cart
Feature: Adding a product to the cart with minimum Quantity to Order

    Background:
        Given the site operates on a store in "Austria"
        And the store "Austria" is the default store
        And the site has a product "TShirt" priced at 10000
        And the product is active and published and available for store "Austria"

    Scenario: Adding product to cart with minimum quantity to order
        Given the product "TShirt" has a minimum order quantity of "100"
        When I add 100 of this product to the cart
        Then I should be on the cart summary page
        And I should be notified that the product has been successfully added
        And there should be one item in my cart
        And this item should have name "TShirt"
        And I should see "TShirt" with unit price "€100.00" in my cart

    Scenario: Adding product to cart with less than minimum quantity to order
        Given the product "TShirt" has a minimum order quantity of "100"
        When I add 99 of this product to the cart
        Then I should be on the cart summary page
        And I should be notified that I need to order at least 100 of TShirt


    Scenario: Adding product to cart with less than minimum quantity to order with smaller quantities
        Given the product "TShirt" has a minimum order quantity of "2"
        When I add 1 of this product to the cart
        Then I should be on the cart summary page
        And I should be notified that I need to order at least 2 of TShirt


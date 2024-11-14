@ui @cart
Feature: Adding a product to the cart with maximum Quantity to Order

    Background:
        Given the site operates on a store in "Austria"
        And the store "Austria" is the default store
        And the site has a product "TShirt" priced at 10000
        And the product is active and published and available for store "Austria"

    Scenario: Adding product to cart with minimum quantity to order
        Given the product "TShirt" has a maximum order quantity of "100"
        When I add 99 of this product to the cart
        Then I should be on the cart summary page
        And I should be notified that the product has been successfully added
        And there should be one item in my cart
        And this item should have name "TShirt"
        And I should see "TShirt" with unit price "€100.00" in my cart

    Scenario: Adding product to cart with less than minimum quantity to order
        Given the product "TShirt" has a maximum order quantity of "100"
        When I add 101 of this product to the cart
        Then I should be on the cart summary page
        And  I should be notified that I can only order a maximum of 100 of TShirt


    Scenario: Adding product to cart with less than minimum quantity to order with smaller quantities
        Given the product "TShirt" has a maximum order quantity of "2"
        When I add 3 of this product to the cart
        Then I should be on the cart summary page
        And  I should be notified that I can only order a maximum of 2 of TShirt


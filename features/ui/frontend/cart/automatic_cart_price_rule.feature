@ui @cart
Feature: Getting an automatic cart price rule
    Background:
        Given the site operates on a store in "Austria"
        And the store "Austria" is the default store
        And the site has a product "TShirt" priced at 10000
        And the product is active and published and available for store "Austria"
        And adding a cart price rule named "Easter Madness"
        And the cart rule is active
        And the cart rule is not a voucher rule

    Scenario: Applying an automatic cart rule with fixed discount to the cart
        Given the cart rule has a action discount with 20 in currency "EUR" off applied on total
        When I add this product to the cart
        Then I should be on the cart summary page
        And I should be notified that the product has been successfully added
        And there should be one item in my cart
        And this item should have name "TShirt"
        And I should see "TShirt" with unit price "€100.00" in my cart
        And my cart's total should be "€80.00"

    Scenario: Applying an automatic cart rule with percentage discount to the cart
        Given the cart rule has a action discount-percent with 30% discount
        When I add this product to the cart
        Then I should be on the cart summary page
        And I should be notified that the product has been successfully added
        And there should be one item in my cart
        And this item should have name "TShirt"
        And I should see "TShirt" with unit price "€100.00" in my cart
        And my cart's total should be "€70.00"

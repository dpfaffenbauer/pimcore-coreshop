@ui @category
Feature: Viewing a product details

  Background:
    Given the site operates on a store in "Austria"
    And the site has a configuration
    And the store "Austria" is the default store
    And the site has two categories "Shoes" and "Coats"
    And the site has a category "Sneakers"
    And the site has a product "Shoe" priced at 12000
    And the product is active and published and available for store "Austria"
    And it is in category "Shoes"
    And the site has a product "Shoe 2" priced at 15000
    And the product is active and published and available for store "Austria"
    And it is in category "Shoes"
    And the site has a product "Jacket" priced at 40000
    And the product is active and published and available for store "Austria"
    And it is in category "Coats"
    And the site has a product "Rain Coat" priced at 25000
    And the product is active and published and available for store "Austria"
    And it is in category "Coats"
    And the site has a product "Winter Coat" priced at 73000
    And the product is active and published and available for store "Austria"
    And it is in category "Coats"
    And the site has a product "Sneaker" priced at 350000
    And the product is active and published and available for store "Austria"
    And it is in category "Sneakers"

  Scenario: Viewing latest products
    When I check latest products
    Then I should see 6 products in the list

  Scenario: Menu left click on Categories
    When I switch to category "Shoes" on left menu
    Then I should see 2 products in the category list
    When I switch to category "Sneakers" on left menu
    Then I should see 1 products in the category list
    When I switch to category "Coats" on left menu
    Then I should see 3 products in the category list
    And I switch to view to "grid"
    And I should see 3 products in the category grid

  Scenario: Menu Main click on Categories
    When I switch to category "Shoes" on main menu
    Then I should see 2 products in the category list
    And I switch to view to "grid"
    And I should see 2 products in the category grid
    And I switch to view to "list"
    Then I should see 2 products in the category list
    When I switch to category "Sneakers" on main menu
    Then I should see 1 products in the category list
    When I switch to category "Coats" on main menu
    Then I should see 3 products in the category list

  Scenario: Sorting in category
    When I switch to category "Coats" on main menu
    Then I should see 3 products in the category list
    And I change order to "Name Descending"
    And I should see products in order "Winter Coat,Rain Coat,Jacket" in list
    And I change order to "Name Ascending"
    And I should see products in order "Jacket,Rain Coat,Winter Coat" in list
    When I switch to category "Shoes" on left menu
    And I change order to "Name Descending"
    And I should see products in order "Shoe 2,Shoe" in list
    And I switch to view to "grid"
    And I should see products in order "Shoe 2,Shoe" in grid
    And I change order to "Name Ascending"
    And I should see products in order "Shoe,Shoe 2" in grid
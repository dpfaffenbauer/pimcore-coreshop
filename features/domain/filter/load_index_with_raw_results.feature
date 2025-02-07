@domain @filter
Feature: To get more performance out of the index, we can also load the raw result
  without needing pimcore's data objects

  Background:
    Given the site operates on a store in "Austria"
    And the site has a index "myindex" for class "CoreShopProduct" with type "mysql"
    And the site has a filter "myfilter" for index "myindex"
    And  the index has following fields:
      | key   | name            | type            | getter          | interpreter   | columnType   |
      | sku   | sku             | object          |                 |               | STRING       |
      | ean   | ean             | object          |                 |               | STRING       |
      | name  | internalName    | localizedfields | localizedfield  | localeMapping | STRING       |

  Scenario: Adding a simple product to the index
    And the site has a product "Shoe" priced at 100
    And the products ean is "123456"
    And the products sku is "654321"
    And the product is active
    And the product is published
    Then the raw result for the filter should look like:
      | o_classId  | o_className     | o_type | active | categoryIds | parentCategoryIds | sku    | ean    | language | name | internalName |
      | cs_product | CoreShopProduct | object | 1      | ,,          | ,,                | 654321 | 123456 | en       | Shoe | Shoe         |

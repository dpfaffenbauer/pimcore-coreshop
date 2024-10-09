@domain @cache @wip
Feature: Adding a new Product and adding it to the cache

  Background:
    Given the site operates on a store in "Austria"
    And the site has a tax rate "AT" with "20%" rate
    And the site has a tax rule group "AT"
    And the tax rule group has a tax rule for country "Austria" with tax rate "AT"
    And the site has a product "T-Shirt" priced at 2000
    And the product has the tax rule group "AT"

  Scenario: Test caching the product
    Given the product "T-Shirt" is cached with key "tshirt"
    And I restore the object from the cache
    Then the cache item should be a DataObject
    And the cache item should have an object-var "taxRule" with value of tax rule group
    And the cache item serialized should have a property "taxRule" with value of tax rule group
    Given I restore the object with Pimcore Cache Helper
    Then the cache object should have an object-var "taxRule" of type ResourceInterface
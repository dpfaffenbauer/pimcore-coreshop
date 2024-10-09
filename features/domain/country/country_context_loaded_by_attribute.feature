@domain @country
Feature: To allow Developers to extend Country Context, they can
  add new ones using PHP8 Attributes

  Scenario: Format the address to given format
    Then there should be a sample country context with priority 1 loaded by attribute as country context

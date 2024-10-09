<?php

declare(strict_types=1);

/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

namespace CoreShop\Behat\Page\Frontend;

use Behat\Mink\Element\NodeElement;
use CoreShop\Bundle\TestBundle\Page\Frontend\AbstractFrontendPage;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Variant\Model\AttributeInterface;

class ProductPage extends AbstractFrontendPage implements ProductPageInterface
{
    use SluggablePageTrait;

    public function getContent(): string
    {
        return $this->getDocument()->getContent();
    }

    public function getName(): string
    {
        return $this->getElement('product_name')->getText();
    }

    public function getPrice(): string
    {
        return $this->getElement('product_price')->getText();
    }

    public function getPriceForUnit(string $unit): string
    {
        return $this->getElement('product_unit_price_' . $unit)->getText();
    }

    public function getOriginalPrice(): string
    {
        return $this->getElement('product_original_price')->getText();
    }

    public function getDiscount(): string
    {
        return $this->getElement('product_discount')->getText();
    }

    public function getTaxRate(): string
    {
        return $this->getElement('product_tax_rate')->getText();
    }

    public function getIsOutOfStock(): bool
    {
        return $this->hasElement('product_ouf_of_stock');
    }

    public function getTax(): string
    {
        return $this->getElement('product_tax')->getText();
    }

    public function getQuantityPriceRules(): array
    {
        return $this->processQuantityPriceRuleElement('[data-test-product-quantity-price-rule]');
    }

    public function getQuantityPriceRulesForUnit(ProductUnitInterface $unit): array
    {
        return $this->processQuantityPriceRuleElement(
            sprintf(
                '[data-test-product-quantity-price-rule-unit-%s]',
                $unit->getId(),
            ),
        );
    }

    public function addToCart(): void
    {
        $this->getElement('add_to_cart')->click();
    }

    public function addToWishlist(): void
    {
        $this->getElement('add_to_wishlist')->click();
    }

    public function addToCartWithQuantity(string $quantity): void
    {
        $this->getElement('quantity')->setValue($quantity);
        $this->getElement('add_to_cart')->click();
    }

    public function addToCartInUnit(ProductUnitDefinitionInterface $unit): void
    {
        $this->getElement('unit')->setValue($unit->getId());
        $this->getElement('add_to_cart')->click();
    }

    public function addToCartInUnitWithQuantity(ProductUnitDefinitionInterface $unit, string $quantity): void
    {
        $this->getElement('unit')->setValue($unit->getId());
        $this->getElement('quantity')->setValue($quantity);
        $this->getElement('add_to_cart')->click();
    }

    public function clickAttribute(AttributeInterface $attribute): void
    {
        $this->getElement('attribute-label', ['%id%' => $attribute->getId()])->click();
    }

    public function isAttributeSelected(AttributeInterface $attribute): bool
    {
        return $this->getElement('attribute', ['%id%' => $attribute->getId()])->isSelected();
    }

    public function isAttributeDisabled(AttributeInterface $attribute): bool
    {
        return $this->getElement('attribute', ['%id%' => $attribute->getId()])->getAttribute('disabled') === 'true';
    }

    public function isAttributeEnabled(AttributeInterface $attribute): bool
    {
        $attr = $this->getElement('attribute', ['%id%' => $attribute->getId()])->getAttribute('disabled');

        return 'false' === $attr || null === $attr;
    }

    protected function processQuantityPriceRuleElement(string $selector): array
    {
        $element = $this->getElement('product_quantity_price_rules');

        return array_map(
            static function (NodeElement $element) {
                $startFromElement = $element->find('css', '[data-test-product-quantity-price-rule-start]');
                $priceElement = $element->find('css', '[data-test-product-quantity-price-rule-price-inc]');
                $priceExcElement = $element->find('css', '[data-test-product-quantity-price-rule-price-exc]');

                return [
                    'text' => $element->getText(),
                    'startingFrom' => $startFromElement->getText(),
                    'price' => $priceElement->getText(),
                    'priceExcl' => $priceExcElement->getText(),
                ];
            },
            $element->findAll('css', $selector),
        );
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'add_to_cart' => '[data-test-add-to-cart]',
            'add_to_wishlist' => '[data-test-add-to-wishlist]',
            'quantity' => '[data-test-quantity]',
            'unit' => '[data-test-unit]',
            'product_name' => '[data-test-product-name]',
            'product_price' => '[data-test-product-price]',
            'product_original_price' => '[data-test-product-original-price]',
            'product_discount' => '[data-test-product-discount]',
            'product_tax_rate' => '[data-test-product-tax-rate]',
            'product_tax' => '[data-test-product-tax]',
            'product_unit_price_carton' => '[data-test-product-unit-price-carton]',
            'product_unit_price_palette' => '[data-test-product-unit-price-palette]',
            'product_quantity_price_rules' => '[data-test-product-quantity-price-rules]',
            'product_ouf_of_stock' => '[data-test-product-out-of-stock]',
            'attribute' => '[data-test-attribute="%id%"]',
            'attribute-label' => '[data-test-attribute-label="%id%"]',
        ]);
    }
}

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

class HomePage extends AbstractFrontendPage implements HomePageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_index';
    }

    public function getContent(): string
    {
        return $this->getDocument()->getContent();
    }

    public function logOut(): void
    {
        $this->getElement('logout_button')->click();
    }

    public function hasLogoutButton(): bool
    {
        return $this->hasElement('logout_button');
    }

    public function getActiveCurrency(): string
    {
        throw new \Exception('Not implemented yet');
    }

    public function getAvailableCurrencies(): array
    {
        throw new \Exception('Not implemented yet');
    }

    public function switchCurrency(string $currencyCode): void
    {
        $this->getElement('currency_selector')->click();

        $this->getElement('currency_selector_code', ['%code%' => $currencyCode])->click();
    }

    public function getActiveLocale(): string
    {
        throw new \Exception('Not implemented yet');
    }

    public function getAvailableLocales(): array
    {
        throw new \Exception('Not implemented yet');
    }

    public function switchLocale(string $localeCode): void
    {
        throw new \Exception('Not implemented yet');
    }

    public function getLatestProductsNames(): array
    {
        return array_map(
            function (NodeElement $element) {
                return $element->getText();
            },
            $this->getElement('latest_products')->findAll('css', '[data-test-product-name]'),
        );
    }

    public function switchToCategoryOnMenuLeft(string $name): void
    {
        $this->getElement('category_menu_left_selector', ['%name%' => $name])->click();
    }

    public function switchToCategoryOnMenuMain(string $name): void
    {
        $this->getElement('category_menu_top_selector', ['%name%' => $name])->click();
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'latest_products' => '[data-test-latest-products]',
            'logout_button' => '[data-test-logout-button]',
            'currency_selector' => '[data-test-currency-selector]',
            'currency_selector_code' => '[data-test-currency-selector-code="%code%"]',
            'category_menu_left_selector' => '[data-test-category-menu-left="%name%"]',
            'category_menu_top_selector' => '[data-test-category-menu-top="%name%"]',
        ]);
    }
}

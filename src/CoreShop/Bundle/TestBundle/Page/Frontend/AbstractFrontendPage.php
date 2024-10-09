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

namespace CoreShop\Bundle\TestBundle\Page\Frontend;

use FriendsOfBehat\PageObjectExtension\Page\SymfonyPage;

abstract class AbstractFrontendPage extends SymfonyPage implements FrontendPageInterface
{
    protected static $additionalParameters = ['_locale' => 'en'];

    public function isOpenWithUri(string $uri): bool
    {
        return $this->getSession()->getCurrentUrl() !== $uri;
    }

    protected function getUrl(array $urlParameters = []): string
    {
        $urlParameters = array_merge($urlParameters, $this->getAdditionalParameters());

        return parent::getUrl($urlParameters);
    }

    protected function getAdditionalParameters(): array
    {
        return [];
    }

    public function scrollIntoView(string $elementId)
    {
        $function = <<<JS
(function(){
  var elem = document.getElementById("$elementId");
  elem.scrollIntoView(false);
})()
JS;

        try {
            $this->getSession()->executeScript($function);
        } catch (\Exception) {
            throw new \Exception('ScrollIntoView failed');
        }

        usleep(400);
    }

    public function tryToOpenWithUri(string $uri): void
    {
        $absoluteUrl = $this->makePathAbsolute($uri);
        $this->getSession()->visit($absoluteUrl);
    }
}

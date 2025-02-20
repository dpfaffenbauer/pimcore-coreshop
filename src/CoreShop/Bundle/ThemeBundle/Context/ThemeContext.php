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

namespace CoreShop\Bundle\ThemeBundle\Context;

use CoreShop\Bundle\ThemeBundle\Service\ThemeNotResolvedException;
use CoreShop\Bundle\ThemeBundle\Service\ThemeResolverInterface;
use Pimcore\Http\Request\Resolver\PimcoreContextResolver;
use Sylius\Bundle\ThemeBundle\Context\SettableThemeContext;
use Sylius\Bundle\ThemeBundle\Context\ThemeContextInterface;
use Sylius\Bundle\ThemeBundle\Model\ThemeInterface;
use Sylius\Bundle\ThemeBundle\Repository\ThemeRepositoryInterface;
use Symfony\Component\HttpFoundation\RequestStack;

final class ThemeContext implements ThemeContextInterface
{
    public function __construct(
        private ThemeResolverInterface $resolver,
        private ThemeRepositoryInterface $themeRepository,
        private PimcoreContextResolver $pimcoreContext,
        private RequestStack $requestStack,
        private SettableThemeContext $settableThemeContext,
    ) {
    }

    public function getTheme(): ?ThemeInterface
    {
        $request = $this->requestStack->getMainRequest();

        if (!$request || null !== $this->settableThemeContext->getTheme()) {
            return $this->settableThemeContext->getTheme();
        }

        $isAjaxBrickRendering = $request->attributes->get('_route') === 'pimcore_admin_document_page_areabrick-render-index-editmode';

        if (!$isAjaxBrickRendering && $this->pimcoreContext->matchesPimcoreContext($request, PimcoreContextResolver::CONTEXT_ADMIN)) {
            return $this->settableThemeContext->getTheme();
        }

        try {
            $theme = $this->themeRepository->findOneByName($this->resolver->resolveTheme());

            if ($theme instanceof ThemeInterface) {
                $this->settableThemeContext->setTheme($theme);
            }

            return $theme;
        } catch (ThemeNotResolvedException) {
            return $this->settableThemeContext->getTheme();
        }
    }
}

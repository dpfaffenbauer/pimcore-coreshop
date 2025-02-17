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

namespace CoreShop\Bundle\ThemeBundle\Service;

use CoreShop\Component\Pimcore\PriorityQueue;
use Pimcore\Model\Document;

final class CompositeThemeResolver implements ThemeResolverInterface, DocumentThemeResolverInterface
{
    private PriorityQueue $themeResolvers;

    public function __construct(
        ) {
        $this->themeResolvers = new PriorityQueue();
    }

    public function register(ThemeResolverInterface $themeResolver, int $priority = 0): void
    {
        $this->themeResolvers->insert($themeResolver, $priority);
    }

    public function resolveTheme(): string
    {
        foreach ($this->themeResolvers as $themeResolver) {
            try {
                return $themeResolver->resolveTheme();
            } catch (ThemeNotResolvedException) {
                continue;
            }
        }

        throw new ThemeNotResolvedException();
    }

    public function resolveThemeForDocument(Document $document): string
    {
        foreach ($this->themeResolvers as $themeResolver) {
            try {
                if ($themeResolver instanceof DocumentThemeResolverInterface) {
                    return $themeResolver->resolveThemeForDocument($document);
                }
            } catch (ThemeNotResolvedException) {
                continue;
            }
        }

        throw new ThemeNotResolvedException();
    }
}

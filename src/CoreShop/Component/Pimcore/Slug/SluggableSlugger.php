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

namespace CoreShop\Component\Pimcore\Slug;

use CoreShop\Component\Pimcore\Exception\SlugNotPossibleException;
use Symfony\Component\String\Slugger\SluggerInterface;

class SluggableSlugger implements SluggableSluggerInterface
{
    public function __construct(
        protected SluggerInterface $slugger,
    ) {
    }

    public function slug(SluggableInterface $sluggable, string $locale, ?string $suffix = null): string
    {
        $fallback = (string) $sluggable->getId();

        if ($sluggable instanceof KeyableSluggableInterface) {
            $fallback = $sluggable->getKey();
        }

        $name = $sluggable->getNameForSlug($locale) ?: $fallback;

        if (!$name) {
            throw new SlugNotPossibleException('name is empty');
        }

        if ($suffix !== null) {
            return sprintf(
                '/%s/%s-%s',
                $locale,
                strtolower($this->slugger->slug($name, '-', $locale)->toString()),
                $suffix,
            );
        }

        return sprintf(
            '/%s/%s',
            $locale,
            strtolower($this->slugger->slug($name, '-', $locale)->toString()),
        );
    }
}

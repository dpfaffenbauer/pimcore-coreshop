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

use CoreShop\Component\Pimcore\Event\SlugGenerationEvent;
use Pimcore\Model\DataObject\Data\UrlSlug;
use Pimcore\Model\Site;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

class DataObjectSiteSlugGenerator implements DataObjectSiteSlugGeneratorInterface
{
    public function __construct(
        private SluggableSluggerInterface $slugger,
        private EventDispatcherInterface $eventDispatcher,
    ) {
    }

    public function generateSlugsForSite(SluggableInterface $sluggable, string $locale, ?Site $site = null): string
    {
        $slug = $this->slugger->slug($sluggable, $locale, null);
        $slug = $this->dispatchSlugEvent($sluggable, $slug, null, $site, $locale);

        $i = 1;

        while (true) {
            /** @psalm-suppress InternalMethod */
            $existingSlug = UrlSlug::resolveSlug($slug, $site?->getId() ?: 0);

            if (null === $existingSlug || $existingSlug->getObjectId() === $sluggable->getId()) {
                break;
            }

            $slug = $this->slugger->slug($sluggable, $locale, (string) $i);
            $slug = $this->dispatchSlugEvent($sluggable, $slug, (string) $i, $site, $locale);

            ++$i;
        }

        return $slug;
    }

    private function dispatchSlugEvent(SluggableInterface $sluggable, string $slug, ?string $prefix = null, ?Site $site = null, ?string $locale = null)
    {
        $event = new SlugGenerationEvent($sluggable, $slug, $prefix, $site, $locale);
        $this->eventDispatcher->dispatch($event);

        return $event->getSlug();
    }
}

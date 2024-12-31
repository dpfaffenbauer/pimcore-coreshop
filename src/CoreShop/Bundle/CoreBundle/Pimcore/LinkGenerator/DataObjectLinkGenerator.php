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

namespace CoreShop\Bundle\CoreBundle\Pimcore\LinkGenerator;

use CoreShop\Component\Pimcore\DataObject\AbstractSluggableLinkGenerator;
use CoreShop\Component\Pimcore\DataObject\InheritanceHelper;
use Pimcore\Model\DataObject\Concrete;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Webmozart\Assert\Assert;

class DataObjectLinkGenerator extends AbstractSluggableLinkGenerator
{
    public function __construct(
        private string $type,
        private string $routeName,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }

    public function generate(object $object, array $params = []): string
    {
        Assert::isInstanceOf($object, Concrete::class);

        $locale = $params['_locale'] ?? null;

        $name = InheritanceHelper::useInheritedValues(function () use ($object, $locale) {
            if (method_exists($object, 'getName')) {
                return $object->getName($locale);
            }

            return '';
        });

        $routeParams = [
            'name' => $this->slugify($name),
            $this->type => $object->getId(),
        ];

        if (isset($locale)) {
            $routeParams['_locale'] = $locale;
        }

        if (!isset($params['referenceType'])) {
            $params['referenceType'] = UrlGeneratorInterface::ABSOLUTE_PATH;
        }

        if (isset($params['site'])) {
            $routeParams['site'] = $params['site'];
        }

        return $this->urlGenerator->generate($params['route'] ?? $this->routeName, $routeParams, $params['referenceType']);
    }
}

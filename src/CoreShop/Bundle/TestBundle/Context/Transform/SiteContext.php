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

namespace CoreShop\Bundle\TestBundle\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Model\Site;
use Webmozart\Assert\Assert;

final class SiteContext implements Context
{
    public function __construct(
        protected SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Transform /^site "([^"]+)"$/
     */
    public function getSiteByKey(string $domain): Site
    {
        $site = Site::getByDomain($domain);

        Assert::isInstanceOf($site, Site::class);

        return $site;
    }

    /**
     * @Transform /^site$/
     */
    public function site(): Site
    {
        $site = $this->sharedStorage->get('site');

        Assert::isInstanceOf($site, Site::class);

        return $site;
    }
}

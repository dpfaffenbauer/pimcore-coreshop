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

namespace CoreShop\Bundle\TestBundle\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Model\Document;
use Pimcore\Model\Site;

final class SiteContext implements Context
{
    public function __construct(
        protected SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Given /^the (document-page) is a Site$/
     */
    public function theDocumentIsASite(Document\Page $document): void
    {
        $site = new Site();
        $site->setRootId($document->getId());

        $this->saveSite($site);
    }

    /**
     * @Given /^the (site) has main-domain "([^"]+)"$/
     * @Given /^the (site "[^"]+") has main-domain "([^"]+)"$/
     */
    public function theSiteHasMainDomain(Site $site, string $domain): void
    {
        $site->setMainDomain($domain);

        $this->saveSite($site);
    }

    /**
     * @Given /^the (site) has additional-domains "([^"]+)"$/
     * @Given /^the (site "[^"]+") has additional-domains "([^"]+)"$/
     */
    public function theSiteHasAAdditionalDomain(Site $site, string $domain): void
    {
        $site->setDomains(explode(',', $domain));

        $this->saveSite($site);
    }

    private function saveSite(Site $site)
    {
        $site->save();
        $this->sharedStorage->set('site', $site);
    }
}

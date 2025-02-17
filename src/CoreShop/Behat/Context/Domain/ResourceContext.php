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

namespace CoreShop\Behat\Context\Domain;

use Behat\Behat\Context\Context;
use CoreShop\Component\Resource\Metadata\Registry;
use Webmozart\Assert\Assert;

final class ResourceContext implements Context
{
    public function __construct(
        private Registry $metadataRegistry,
    ) {
    }

    /**
     * @Then /^the (class "[^"]+") is registered as Pimcore Resource$/
     */
    public function theClassIsRegisteredAsPimcoreResource(): void
    {
        $car = $this->metadataRegistry->get('app.car');

        Assert::eq($car->getClass('model'), 'Pimcore\Model\DataObject\Car');
    }
}

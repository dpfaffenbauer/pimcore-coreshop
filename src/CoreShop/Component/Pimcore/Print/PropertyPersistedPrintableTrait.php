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

namespace CoreShop\Component\Pimcore\Print;

use Pimcore\Model\Asset;
use Pimcore\Model\Element\ElementInterface;
use Webmozart\Assert\Assert;

trait PropertyPersistedPrintableTrait
{
    public function getRenderedPrintable(array $params = []): ?Asset
    {
        /**
         * @var ElementInterface $this
         */
        Assert::isInstanceOf($this, ElementInterface::class);

        return $this->getProperty('rendered_asset');
    }

    public function setRenderedPrintable(Asset $asset, array $params = []): void
    {
        /**
         * @var ElementInterface $this
         */
        Assert::isInstanceOf($this, ElementInterface::class);

        $this->setProperty('rendered_asset', 'asset', $asset);
    }
}

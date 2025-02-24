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

namespace CoreShop\Bundle\InventoryBundle\Pimcore\Renderer;

use CoreShop\Component\Inventory\Model\StockableInterface;
use Pimcore\Model\DataObject\ClassDefinition\Layout\DynamicTextLabelInterface;
use Pimcore\Model\DataObject\Concrete;
use Twig\Environment;

class StockOnHandRenderer implements DynamicTextLabelInterface
{
    public function __construct(
        private Environment $twig,
    ) {
    }

    public function renderLayoutText(string $data, ?Concrete $object, array $params): string
    {
        if (!$object instanceof StockableInterface) {
            return '';
        }

        return $this->twig->render('@CoreShopInventory/pimcore/stock_text.html.twig', [
            'stockable' => $object,
        ]);
    }
}

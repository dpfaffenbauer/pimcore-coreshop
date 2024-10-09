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

namespace CoreShop\Component\Order\Model;

use Carbon\Carbon;
use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreModel;

abstract class OrderShipment extends AbstractPimcoreModel implements OrderShipmentInterface
{
    public static function getDocumentType(): string
    {
        return 'shipment';
    }

    public function getPrintBodyController(array $params = []): string
    {
        return 'CoreShop\Bundle\OrderBundle\Controller\OrderDocumentPrintController::shipmentAction';
    }

    public function getPrintHeaderController(array $params = []): string
    {
        return 'CoreShop\Bundle\OrderBundle\Controller\OrderDocumentPrintController::headerAction';
    }

    public function getPrintFooterController(array $params = []): string
    {
        return 'CoreShop\Bundle\OrderBundle\Controller\OrderDocumentPrintController::footerAction';
    }

    public function getRenderedAsset()
    {
        return $this->getProperty('rendered_asset');
    }

    public function setRenderedAsset($renderedAsset)
    {
        $this->setProperty('rendered_asset', 'asset', $renderedAsset);
    }

    public function getDocumentDate(): ?Carbon
    {
        return $this->getShipmentDate();
    }

    public function setDocumentDate(?Carbon $documentDate)
    {
        return $this->setShipmentDate($documentDate);
    }

    public function getDocumentNumber(): ?string
    {
        return $this->getShipmentNumber();
    }

    public function setDocumentNumber(?string $documentNumber)
    {
        return $this->setShipmentNumber($documentNumber);
    }
}

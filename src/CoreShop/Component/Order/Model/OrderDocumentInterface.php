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
use CoreShop\Component\Pimcore\Print\PrintableInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Pimcore\Model\PimcoreModelInterface;

interface OrderDocumentInterface extends ResourceInterface, PimcoreModelInterface, PrintableInterface
{
    public function getId(): ?int;

    public static function getDocumentType(): string;

    public function getOrder(): ?OrderInterface;

    public function setOrder(?OrderInterface $order);

    public function getState(): ?string;

    public function setState(?string $state);

    public function getDocumentDate(): ?Carbon;

    public function setDocumentDate(?Carbon $documentDate);

    public function getDocumentNumber(): ?string;

    public function setDocumentNumber(?string $documentNumber);

    /**
     * @return OrderDocumentItemInterface[]
     */
    public function getItems(): ?array;

    /**
     * @param OrderDocumentItemInterface[] $items
     */
    public function setItems(array $items);

    /**
     * @return mixed
     */
    public function getRenderedAsset();

    /**
     * @param mixed $renderedAsset
     */
    public function setRenderedAsset($renderedAsset);
}

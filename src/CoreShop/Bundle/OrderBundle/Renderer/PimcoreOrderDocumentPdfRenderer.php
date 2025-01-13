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

namespace CoreShop\Bundle\OrderBundle\Renderer;

use CoreShop\Bundle\ThemeBundle\Service\ThemeHelperInterface;
use CoreShop\Component\Order\Model\OrderDocumentInterface;
use CoreShop\Component\Order\Renderer\OrderDocumentRendererInterface;
use CoreShop\Component\Pimcore\Print\PrintablePdfRendererInterface;

class PimcoreOrderDocumentPdfRenderer implements OrderDocumentRendererInterface
{
    public function __construct(
        private PrintablePdfRendererInterface $pdfRenderer,
        private ThemeHelperInterface $themeHelper,
    ) {
    }

    public function renderDocumentPdf(OrderDocumentInterface $orderDocument): string
    {
        return $this->themeHelper->useTheme($orderDocument->getOrder()->getStore()->getTemplate(), function () use ($orderDocument) {
            /**
             * Gotenberg Supported for now, Chromium Headless not properly tested
             * */
            $params = [
                'id' => $orderDocument->getId(),
                'order' => $orderDocument->getOrder(),
                'document' => $orderDocument,
                'language' => (string) $orderDocument->getOrder()->getLocaleCode(),
                'type' => $orderDocument::getDocumentType(),
                $orderDocument::getDocumentType() => $orderDocument,
                'locale' => $orderDocument->getOrder()?->getLocaleCode(),
            ];

            return $this->pdfRenderer->renderPrintable(
                $orderDocument,
                $params,
            );
        });
    }
}

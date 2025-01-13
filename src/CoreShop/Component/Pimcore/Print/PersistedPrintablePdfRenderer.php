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

class PersistedPrintablePdfRenderer implements PrintablePdfRendererInterface
{
    public function __construct(
        private PrintablePdfRendererInterface $inner,
        private bool $debug,
    ) {
    }

    public function renderPrintable(PrintableInterface $printable, array $params = []): string
    {
        if (!$printable instanceof PersistedPrintableInterface) {
            return $this->inner->renderPrintable($printable, $params);
        }

        /**
         * @var PrintableInterface&PersistedPrintableInterface $printable
         */

        // if in debug, do not store document for implementation purposes.
        if ($this->debug) {
            return $this->inner->renderPrintable($printable, $params);
        }

        $renderedAsset = $printable->getRenderedPrintable($params);

        if ($renderedAsset instanceof Asset) {
            // check if asset is outdated.
            if (method_exists($printable, 'getModificationDate')) {
                if ($renderedAsset->getCreationDate() >= $printable->getModificationDate()) {
                    $data = $renderedAsset->getData();

                    if ($data !== false) {
                        return $data;
                    }
                }
            }

            $data = $renderedAsset->getData();

            if ($data !== false) {
                return $data;
            }
        }

        $pdfContent = $this->inner->renderPrintable($printable, $params);

        $assetPath = $printable->getPersistedPath();
        $assetName = sprintf('%s.pdf', $printable->getPersistedName($params));

        $document = Asset\Document::getByPath($assetPath . '/' . $assetName);

        if ($document instanceof Asset\Document) {
            $document->delete();
        }

        $document = new Asset\Document();
        $document->setFilename($assetName);
        $document->setParent(Asset\Service::createFolderByPath($assetPath));
        $document->setData($pdfContent);
        $document->save();

        $printable->setRenderedPrintable($document);

        if (method_exists($printable, 'save')) {
            $printable->save();
        }

        return $pdfContent;
    }
}

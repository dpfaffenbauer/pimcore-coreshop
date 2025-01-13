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

use CoreShop\Bundle\OrderBundle\Controller\OrderDocumentPrintController;
use CoreShop\Bundle\OrderBundle\Event\WkhtmlOptionsEvent;
use CoreShop\Bundle\OrderBundle\Renderer\Pdf\PdfRendererInterface;
use CoreShop\Bundle\ThemeBundle\Service\ThemeHelperInterface;
use CoreShop\Component\Order\Model\OrderDocumentInterface;
use CoreShop\Component\Order\Renderer\OrderDocumentRendererInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Controller\ControllerReference;
use Symfony\Component\HttpKernel\Fragment\FragmentRendererInterface;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

/**
 * @deprecated Deprecated since CoreShop 4.1, to be removed in CoreShop 5.0. Use PimcoreOrderDocumentPdfRenderer instead.
 */
class OrderDocumentPdfRenderer implements OrderDocumentRendererInterface
{
    public function __construct(
        private FragmentRendererInterface $fragmentRenderer,
        private EventDispatcherInterface $eventDispatcher,
        private PdfRendererInterface $renderer,
        private ThemeHelperInterface $themeHelper,
    ) {
    }

    public function renderDocumentPdf(OrderDocumentInterface $orderDocument): string
    {
        trigger_deprecation(
            'coreshop/order-bundle',
            '4.1',
            'The "%s" class is deprecated and will be removed in CoreShop 5.0. Use "%s" instead.',
            PimcoreOrderDocumentPdfRenderer::class,
            self::class,
        );

        return $this->themeHelper->useTheme($orderDocument->getOrder()->getStore()->getTemplate(), function () use ($orderDocument) {
            $params = [
                'id' => $orderDocument->getId(),
                'order' => $orderDocument->getOrder(),
                'document' => $orderDocument,
                'language' => (string) $orderDocument->getOrder()->getLocaleCode(),
                'type' => $orderDocument::getDocumentType(),
                $orderDocument::getDocumentType() => $orderDocument,
            ];

            $request = new Request($params);
            $request->setLocale($orderDocument->getOrder()->getLocaleCode());

            $printController = OrderDocumentPrintController::class;

            $printContentAction = $orderDocument::getDocumentType() . 'Action';
            $printFooterAction = 'footerAction';
            $printHeaderAction = 'headerAction';

            $referenceFooter = new ControllerReference(sprintf('%s::%s', $printController, $printFooterAction), $params);
            $referenceHeader = new ControllerReference(sprintf('%s::%s', $printController, $printHeaderAction), $params);
            $referenceContent = new ControllerReference(sprintf('%s::%s', $printController, $printContentAction), $params);

            $contentHeader = $this->fragmentRenderer->render($referenceHeader, $request)->getContent();
            $contentFooter = $this->fragmentRenderer->render($referenceFooter, $request)->getContent();
            $content = $this->fragmentRenderer->render($referenceContent, $request)->getContent();

            $event = new WkhtmlOptionsEvent($orderDocument);

            $this->eventDispatcher->dispatch(
                $event,
                sprintf('coreshop.order.%s.wkhtml.options', $orderDocument::getDocumentType()),
            );

            return $this->renderer->fromString(
                $content ?: '',
                $contentHeader ?: '',
                $contentFooter ?: '',
                ['options' => [$event->getOptions()]],
            );
        });
    }
}

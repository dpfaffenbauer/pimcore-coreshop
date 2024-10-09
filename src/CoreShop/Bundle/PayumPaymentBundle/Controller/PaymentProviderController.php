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

namespace CoreShop\Bundle\PayumPaymentBundle\Controller;

use CoreShop\Bundle\ResourceBundle\Controller\ResourceController;
use CoreShop\Component\PayumPayment\Model\PaymentProviderInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class PaymentProviderController extends ResourceController
{
    public function getAction(Request $request): JsonResponse
    {
        $this->isGrantedOr403();

        $resources = $this->findOr404((int) $this->getParameterFromRequest($request, 'id'));

        $form = $this->resourceFormFactory->create($this->metadata, $resources);

        /**
         * @var PaymentProviderInterface $formData
         */
        $formData = $form->getData();

        return $this->viewHandler->handle(['data' => $formData, 'success' => true], ['group' => 'Detailed']);
    }

    public function getConfigAction(): Response
    {
        $factoryResults = [];

        foreach (array_keys($this->getParameter('coreshop.gateway_factories')) as $factory) {
            $factoryResults[] = [
                'type' => $factory,
                'name' => $factory,
            ];
        }

        return $this->viewHandler->handle(
            [
                'success' => true,
                'factories' => $factoryResults,
            ],
        );
    }
}

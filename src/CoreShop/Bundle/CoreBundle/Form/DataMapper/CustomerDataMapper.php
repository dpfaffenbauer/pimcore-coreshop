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

namespace CoreShop\Bundle\CoreBundle\Form\DataMapper;

use CoreShop\Component\Core\Model\CustomerInterface;
use Symfony\Component\Form\DataMapperInterface;
use Symfony\Component\Form\Extension\Core\DataMapper\DataMapper;

class CustomerDataMapper implements DataMapperInterface
{
    private DataMapper $propertyPathDataMapper;

    public function __construct(
        ) {
        $this->propertyPathDataMapper = new DataMapper();
    }

    public function mapDataToForms(mixed $viewData, \Traversable $forms): void
    {
        $formsOtherThanAddress = [];

        foreach ($forms as $key => $form) {
            if ($viewData instanceof CustomerInterface && $key === 'address') {
                $address = $viewData->getAddresses();

                if (count($address) > 0) {
                    $form->setData($address[0]);
                }

                continue;
            }

            $formsOtherThanAddress[] = $form;
        }

        if (!empty($formsOtherThanAddress)) {
            $this->propertyPathDataMapper->mapDataToForms($viewData, new \ArrayObject($formsOtherThanAddress));
        }
    }

    public function mapFormsToData(\Traversable $forms, mixed &$viewData): void
    {
        $formsOtherThanAddress = [];

        foreach ($forms as $key => $form) {
            if ($key === 'address') {
                $address = $form->getData();

                if (null !== $address) {
                    $viewData->setAddresses([$form->getData()]);
                }

                continue;
            }

            $formsOtherThanAddress[] = $form;
        }

        if (!empty($formsOtherThanAddress)) {
            $this->propertyPathDataMapper->mapFormsToData(new \ArrayObject($formsOtherThanAddress), $viewData);
        }
    }
}

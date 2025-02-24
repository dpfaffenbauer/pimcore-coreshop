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

namespace CoreShop\Bundle\CoreBundle\Form\Extension;

use CoreShop\Bundle\ProductQuantityPriceRulesBundle\Form\Type\ProductQuantityRangeCollectionType;
use CoreShop\Component\Core\Model\QuantityRangeInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class ProductQuantityRangeCollectionTypeExtension extends AbstractTypeExtension
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->addEventListener(FormEvents::POST_SUBMIT, function (FormEvent $event) {
            /** @var ArrayCollection $data */
            $data = $event->getData();
            $form = $event->getForm();
            $dataCheck = [];

            /**
             * @var int                    $rowIndex
             * @var QuantityRangeInterface $quantityRange
             */
            foreach ($data as $rowIndex => $quantityRange) {
                $realRowIndex = $rowIndex + 1;

                $unit = $quantityRange->getUnitDefinition() instanceof ProductUnitDefinitionInterface ? $quantityRange->getUnitDefinition()->getUnitName() : 'default';

                if (!isset($dataCheck[$unit])) {
                    $dataCheck[$unit] = [];
                }

                $dataCheck[$unit][] = [
                    'row' => $realRowIndex,
                    'startingFrom' => $quantityRange->getRangeStartingFrom(),
                ];
            }

            foreach ($dataCheck as $quantityRangesToCheck) {
                $lastEnd = -1;

                /**
                 * @var array $quantityRangeToCheck
                 */
                foreach ($quantityRangesToCheck as $quantityRangeToCheck) {
                    $realRowIndex = $quantityRangeToCheck['row'];
                    $startingFrom = $quantityRangeToCheck['startingFrom'];

                    if ((float) $startingFrom < 0) {
                        $form->addError(new FormError(sprintf('Field "starting from" in row %s needs to be greater or equal than 0', $realRowIndex)));

                        break;
                    }

                    if ((float) $startingFrom <= $lastEnd) {
                        $form->addError(new FormError(sprintf('Field "starting from" in row %s  needs to be greater than %s', $realRowIndex, $lastEnd)));

                        break;
                    }

                    $lastEnd = (float) $startingFrom;
                }
            }
        });
    }

    public static function getExtendedTypes(): iterable
    {
        return [ProductQuantityRangeCollectionType::class];
    }
}

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

use CoreShop\Bundle\OrderBundle\Form\Type\QuantityType;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

final class QuantityTypeExtension extends AbstractTypeExtension
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'unit_definition' => null,
            'attr' => [
                'min' => 0,
                'step' => 1,
                'data-cs-unit-precision' => 0,
                'autocomplete' => 'off',
            ],
        ]);

        $resolver->setAllowedTypes('html5', 'bool');
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        if ($options['unit_definition'] instanceof ProductUnitDefinitionInterface) {
            $precision = $options['unit_definition']->getPrecision();
            $view->vars['attr']['data-cs-unit-precision'] = $precision;

            if ($precision > 0) {
                $view->vars['attr']['step'] = sprintf('0.%s1', str_repeat('0', $precision - 1));
            }
        }
    }


    public static function getExtendedTypes(): iterable
    {
        return [QuantityType::class];
    }
}

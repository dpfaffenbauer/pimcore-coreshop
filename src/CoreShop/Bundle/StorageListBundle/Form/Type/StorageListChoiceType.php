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

namespace CoreShop\Bundle\StorageListBundle\Form\Type;

use CoreShop\Component\StorageList\Model\NameableStorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Resolver\StorageListResolverInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\OptionsResolver\Options;
use Symfony\Component\OptionsResolver\OptionsResolver;

abstract class StorageListChoiceType extends AbstractType
{
    public function __construct(
        private StorageListResolverInterface $listResolver,
    ) {
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver
            ->setDefaults([
                'context' => [],
                'choices' => function (Options $options) {
                    return $this->listResolver->getStorageLists($options['context']);
                },
                'choice_value' => 'id',
                'choice_label' => function (StorageListInterface $list) {
                    if ($list instanceof NameableStorageListInterface && $list->getName()) {
                        return $list->getName();
                    }

                    return 'default';
                },
                'choice_translation_domain' => false,
                'active' => true,
                'expanded' => true,
            ])
        ;
    }

    public function getParent(): string
    {
        return ChoiceType::class;
    }

    public function getBlockPrefix(): string
    {
        return 'coreshop_storage_list_choice_type';
    }
}

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

namespace CoreShop\Bundle\ResourceBundle\EventListener;

use CoreShop\Bundle\ResourceBundle\DeepCopy\PimcoreFieldCollectionDefinitionMatcher;
use CoreShop\Bundle\ResourceBundle\DeepCopy\PimcoreFieldCollectionDefinitionReplaceFilter;
use CoreShop\Bundle\ResourceBundle\Pimcore\CacheMarshallerInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use DeepCopy\DeepCopy;
use DeepCopy\Filter\Doctrine\DoctrineCollectionFilter;
use DeepCopy\Matcher\PropertyTypeMatcher;
use DeepCopy\TypeMatcher\TypeMatcher;
use Pimcore\Event\SystemEvents;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData;
use Pimcore\Model\Element\DeepCopy\PimcoreClassDefinitionMatcher;
use Pimcore\Model\Element\DeepCopy\PimcoreClassDefinitionReplaceFilter;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;

class DeepCopySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            SystemEvents::SERVICE_PRE_GET_DEEP_COPY => 'addDoctrineCollectionFilter',
        ];
    }

    public function addDoctrineCollectionFilter(GenericEvent $event): void
    {
        $context = $event->getArgument('context');

        /**
         * @var DeepCopy $copier
         */
        $copier = $event->getArgument('copier');

        //Only add if not already been added
        if (!($context['defaultFilters'] ?? false)) {
            $copier->addFilter(
                new DoctrineCollectionFilter(),
                new PropertyTypeMatcher('Doctrine\Common\Collections\Collection'),
            );
            $event->setArgument('copier', $copier);
        }

        if (($context['source'] ?? false) === 'Pimcore\Model\Version::marshalData') {
            /**
             * Pimcore handles CustomVersionMarshallInterface for Objects, but not for Fieldcollections
             * this means that our custom types, get fully copied and serialized in to the version file
             * meaning that for Cart Price Rules, you can end up serializing 100MB of data.... 🙈
             */
            $copier->addFilter(
                new PimcoreFieldCollectionDefinitionReplaceFilter(
                    function (AbstractData $object, Data $fieldDefinition, mixed $property, mixed $currentValue): mixed {
                        if ($fieldDefinition instanceof Data\CustomVersionMarshalInterface) {
                            return $fieldDefinition->marshalVersion($object->getObject(), $currentValue);
                        }

                        return $currentValue;
                    }
                ),
                new PimcoreFieldCollectionDefinitionMatcher(Data\CustomVersionMarshalInterface::class)
            );
        }

        if (($context['source'] ?? false) === 'Pimcore\Model\Version::unmarshalData') {
            $copier->addFilter(
                new PimcoreFieldCollectionDefinitionReplaceFilter(
                    function (AbstractData $object, Data $fieldDefinition, mixed $property, mixed $currentValue): mixed {
                        if ($fieldDefinition instanceof Data\CustomVersionMarshalInterface) {
                            return $fieldDefinition->unmarshalVersion($object->getObject(), $currentValue);
                        }

                        return $currentValue;
                    }
                ),
                new PimcoreFieldCollectionDefinitionMatcher(Data\CustomVersionMarshalInterface::class)
            );
        }

        if (($context['source'] ?? false) === 'Pimcore\Cache\Core\CoreCacheHandler::storeCacheData') {
            /**
             * This honestly absolutely sucks:
             *
             * Pimcore's cache marshalling is quite inconsistent:
             *  - for marshalling they use DeepCopy
             *  - for unmarshalling they use default symfony behaviour
             * WHY???
             * Why not simply use one for all and make it easier to extend or overwrite
             *
             * The Idea behind this is: this marshall's (sort of) the information for caching
             * (We don't want to serialize all doctrine entities into cache, too slow, too much unnecessary queries)
             *
             * The CoreShop\Bundle\ResourceBundle\Cache\CoreCacheHandlerDecorator then
             * is responsible for unmarshalling the data again
             *
             * We have to do it in this order since Pimcore first does the DeepCopy and then
             * Pimcore CoreCacheHandler Marshalling, meaning for us, we cannot simply do it in one place either
             */
            /** @psalm-suppress MissingClosureParamType */
            $copier->addTypeFilter(
                new \DeepCopy\TypeFilter\ReplaceFilter(
                    function ($currentValue) {
                        if (!$currentValue instanceof Concrete) {
                            return $currentValue;
                        }

                        $class = $currentValue->getClass();

                        foreach ($class->getFieldDefinitions() as $fd) {
                            if (!$fd instanceof CacheMarshallerInterface) {
                                continue;
                            }

                            $currentValue->setObjectVar(
                                $fd->getName(),
                                $fd->marshalForCache($currentValue, $currentValue->getObjectVar($fd->getName())),
                            );
                        }

                        return $currentValue;
                    },
                ),
                new TypeMatcher(Concrete::class),
            );
        }
    }
}

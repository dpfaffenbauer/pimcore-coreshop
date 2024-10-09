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

namespace CoreShop\Bundle\TestBundle\Context\Domain;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\ClassStorageInterface;
use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\Fieldcollection;
use Pimcore\Model\DataObject\Objectbrick;
use Webmozart\Assert\Assert;

final class ClassContext implements Context
{
    public function __construct(
        private ClassStorageInterface $classStorage,
    ) {
    }

    /**
     * @Then /^there should be a pimcore class "([^"]+)"$/
     */
    public function thereShouldBeAPimcoreClass($name): void
    {
        $definition = ClassDefinition::getByName($this->classStorage->get($name));

        Assert::notNull(
            $definition,
            sprintf('Pimcore Class with name "%s" not found', $name),
        );
    }

    /**
     * @Then /^there should be a pimcore brick "([^"]+)"$/
     */
    public function thereShouldBeAPimcoreBrick($name): void
    {
        $definition = Objectbrick\Definition::getByKey($this->classStorage->get($name));

        Assert::notNull(
            $definition,
            sprintf('Pimcore Brick with key "%s" not found', $name),
        );
    }

    /**
     * @Then /^there should be a pimcore field-collection "([^"]+)"$/
     */
    public function thereShouldBeAPimcoreCollection($name): void
    {
        $definition = Fieldcollection\Definition::getByKey($this->classStorage->get($name));

        Assert::notNull(
            $definition,
            sprintf('Pimcore Fieldcollection with key "%s" not found', $name),
        );
    }

    /**
     * @Then /^the (definition) should have a field named "([^"]+)"$/
     */
    public function theDefinitionShouldHaveAField($definition, $name): void
    {
        if ($definition instanceof Objectbrick\Definition) {
            $field = $definition->getFieldDefinition($name);
        } elseif ($definition instanceof Fieldcollection\Definition) {
            $field = $definition->getFieldDefinition($name);
        } elseif ($definition instanceof ClassDefinition) {
            $field = $definition->getFieldDefinition($name);
        } else {
            throw new \InvalidArgumentException(
                sprintf('Definition with type %s is not supported', null !== $definition ? $definition::class : 'null'),
            );
        }

        Assert::isInstanceOf(
            $field,
            ClassDefinition\Data::class,
            sprintf('Could not find field with name "%s" in definition', $name),
        );
    }

    /**
     * @Then /^an instance of (definition) should implement "([^"]+)"$/
     */
    public function anInstanceofDefinitionShouldImplement($definition, $class): void
    {
        if ($definition instanceof ClassDefinition) {
            $className = sprintf('Pimcore\\Model\\DataObject\\%s', $definition->getName());

            /**
             * @psalm-var class-string $class
             *
             * @psalm-suppress InvalidStringClass
             */
            $instance = new $className();

            Assert::isInstanceOf($instance, $class);
        }
    }
}

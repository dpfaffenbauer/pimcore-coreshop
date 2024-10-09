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

namespace CoreShop\Bundle\TestBundle\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\ClassStorageInterface;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Cache\RuntimeCache;
use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\DataObject\Fieldcollection\Definition;
use Webmozart\Assert\Assert;

final class ClassContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ClassStorageInterface $classStorage,
    ) {
    }

    /**
     * @Transform /^class "([^"]+)"$/
     */
    public function class($name): ClassDefinition
    {
        RuntimeCache::clear();

        /**
         * @psalm-suppress UndefinedConstant
         */
        $fqcp = sprintf('%s/DataObject/%s.php', PIMCORE_CLASS_DIRECTORY, $name);
        $fqcn = sprintf('\\Pimcore\\Model\\DataObject\\%s', $name);

        if (file_exists($fqcp) && !class_exists($fqcn)) {
            /**
             * @psalm-suppress UnresolvableInclude
             */
            require_once $fqcp;
        }

        $classDefinition = ClassDefinition::getByName($name);

        Assert::notNull($classDefinition, sprintf('Class Definition for class with name %s not found', $name));

        return $classDefinition;
    }

    /**
     * @Transform /^behat-class "([^"]+)"$/
     */
    public function behatClass($name): ClassDefinition
    {
        return $this->class($this->classStorage->get($name));
    }

    /**
     * @Transform /^field-collection "([^"]+)"$/
     */
    public function fieldCollection($name): Definition
    {
        $name = $this->classStorage->get($name);

        $definition = Definition::getByKey($name);

        Assert::notNull($definition, sprintf('Definition for fieldcollection with key %s not found', $name));

        return $definition;
    }

    /**
     * @Transform /^object-instance$/
     */
    public function objectInstance(): Concrete
    {
        return $this->sharedStorage->get('object-instance');
    }

    /**
     * @Transform /^object-instance-2$/
     */
    public function objectInstance2(): Concrete
    {
        return $this->sharedStorage->get('object-instance-2');
    }

    /**
     * @Transform /^object-instance "([^"]+)"$/
     */
    public function objectInstanceWithKey($key): Concrete
    {
        return Concrete::getByPath('/' . $key);
    }

    /**
     * @Transform /^definition/
     * @Transform /^definitions/
     */
    public function definition(): ClassDefinition|Definition
    {
        /**
         * @psalm-suppress DeprecatedClass
         * @psalm-suppress DeprecatedMethod
         */
        RuntimeCache::clear();

        $name = $this->sharedStorage->get('pimcore_definition_name');
        $class = $this->sharedStorage->get('pimcore_definition_class');

        if ($class === ClassDefinition::class) {
            return ClassDefinition::getByName($this->classStorage->get($name));
        }

        return $class::getByKey($this->classStorage->get($name));
    }
}

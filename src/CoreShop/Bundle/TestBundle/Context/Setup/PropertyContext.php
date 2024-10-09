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

namespace CoreShop\Bundle\TestBundle\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\Element\ElementInterface;

class PropertyContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Given /^the (element) has a text property with name "([^"]+)" value "([^"]+)"$/
     */
    public function theElementHasATextPropertyWithValue(ElementInterface $element, string $name, string $value): void
    {
        $element->setProperty($name, 'text', $value, false, false);
        $element->save();
    }

    /**
     * @Given /^the (element) has a text property with name "([^"]+)" value "([^"]+)" that inherits$/
     */
    public function theElementHasATextPropertyWithValueWithInheritances(ElementInterface $element, string $name, string $value): void
    {
        $element->setProperty($name, 'text', $value, false, true);
        $element->save();
    }

    /**
     * @Given /^the (element) has a object property with name "([^"]+)" and (object)$/
     */
    public function theElementHasATextPropertyWithObject(ElementInterface $element, string $name, Concrete $object): void
    {
        $element->setProperty($name, 'object', $object, false, false);
        $element->save();
    }

    /**
     * @Given /^the (element) has a object property with name "([^"]+)" and (object) that inherits$/
     */
    public function theElementHasATextPropertyWithObjectWithInheritance(ElementInterface $element, string $name, Concrete $object): void
    {
        $element->setProperty($name, 'object', $object, false, true);
        $element->save();
    }
}

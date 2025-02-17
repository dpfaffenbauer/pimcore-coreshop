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

namespace CoreShop\Component\Pimcore\DataObject;

use CoreShop\Component\Pimcore\Exception\ClassDefinitionNotFoundException;
use Pimcore\Model\DataObject;
use Webmozart\Assert\Assert;

class BrickDefinitionUpdate extends AbstractDefinitionUpdate
{
    private DataObject\Objectbrick\Definition $brickDefinition;

    public function __construct(
        string $brickKey,
    ) {
        parent::__construct();

        $brickDefinition = DataObject\Objectbrick\Definition::getByKey($brickKey);

        if (null === $brickDefinition) {
            throw new ClassDefinitionNotFoundException(sprintf('Brick Definition %s not found', $brickKey));
        }

        $this->brickDefinition = $brickDefinition;
        $this->fieldDefinitions = $this->brickDefinition->getFieldDefinitions();
        /** @psalm-suppress InvalidArgument */
        $this->jsonDefinition = json_decode(DataObject\ClassDefinition\Service::generateObjectBrickJson($this->brickDefinition), true);
        $this->originalJsonDefinition = $this->jsonDefinition;
    }

    public function save(): bool
    {
        $json = json_encode($this->jsonDefinition);

        Assert::string($json);

        return DataObject\ClassDefinition\Service::importObjectBrickFromJson($this->brickDefinition, $json, true);
    }
}

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

use Pimcore\Bundle\AdminBundle\Model\GridConfig;
use Webmozart\Assert\Assert;

class GridConfigInstaller implements GridConfigInstallerInterface
{
    public function installGridConfig(array $config, string $name, string $class, bool $overwrite = false): void
    {
        /** @psalm-suppress InternalClass */
        $list = new GridConfig\Listing();
        $list->addConditionParam('name = ?', $name);
        $elements = $list->load();

        if (count($elements) === 0) {
            /** @psalm-suppress InternalClass */
            $gridConfig = new GridConfig();
        } elseif ($overwrite) {
            $gridConfig = $elements[0];
        } else {
            return;
        }

        $config['classId'] = $class;

        $configDataEncoded = json_encode($config);

        Assert::string($configDataEncoded);

        /** @psalm-suppress InternalMethod */
        $gridConfig->setName($name);
        /** @psalm-suppress InternalMethod */
        $gridConfig->setShareGlobally(true);
        /** @psalm-suppress InternalMethod */
        $gridConfig->setConfig($configDataEncoded);
        /** @psalm-suppress InternalMethod */
        $gridConfig->setOwnerId(0);
        /** @psalm-suppress InternalMethod */
        $gridConfig->setSearchType('folder');
        /** @psalm-suppress InternalMethod */
        $gridConfig->setClassId($class);
        /** @psalm-suppress InternalMethod */
        $gridConfig->save();
    }
}

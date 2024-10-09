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

namespace CoreShop\Bundle\CoreBundle\Application;

final class Version
{
    public const MAJOR_VERSION = '4';

    public const MINOR_VERSION = '1';

    public const RELEASE_VERSION = '0';

    public const EXTRA_VERSION = 'RC1';

    public static function getVersion(): string
    {
        $version = sprintf('%s.%s.%s', self::MAJOR_VERSION, self::MINOR_VERSION, self::RELEASE_VERSION);

        /** @psalm-suppress RedundantCondition */
        if (self::EXTRA_VERSION !== '') {
            $version = sprintf('%s-%s', $version, self::EXTRA_VERSION);
        }

        return $version;
    }
}

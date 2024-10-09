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
use Pimcore\Model\DataObject\Data\RgbaColor;

final class RgbaColorContext implements Context
{
    /**
     * @Transform /^color #([a-f0-9]{6}|[a-f0-9]{3})$/
     * @Transform /^color #([a-f0-9]{6}|[a-f0-9]{3}) and opacity (\d+)$/
     */
    public function hex(string $color, int $opacity = 255): RgbaColor
    {
        if (strlen($color) === 6) {
            $hex = [$color[0] . $color[1], $color[2] . $color[3], $color[4] . $color[5]];
        } elseif (strlen($color) == 3) {
            $hex = [$color[0] . $color[0], $color[1] . $color[1], $color[2] . $color[2]];
        } else {
            throw new \Exception('Invalid data given');
        }

        $rgb = array_map('hexdec', $hex);

        return new RgbaColor($rgb[0], $rgb[1], $rgb[2], $opacity);
    }
}

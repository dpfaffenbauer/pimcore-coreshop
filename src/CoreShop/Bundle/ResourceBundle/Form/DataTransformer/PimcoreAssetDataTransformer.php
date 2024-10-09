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

namespace CoreShop\Bundle\ResourceBundle\Form\DataTransformer;

use Pimcore\Model\Asset;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;

class PimcoreAssetDataTransformer implements DataTransformerInterface
{
    public function transform(mixed $value): ?int
    {
        if ($value instanceof Asset) {
            return $value->getId();
        }

        return null;
    }

    public function reverseTransform(mixed $value): ?Asset
    {
        if (!$value) {
            return null;
        }

        $asset = Asset::getById($value);

        if (null === $asset) {
            throw new TransformationFailedException(sprintf(
                'An asset with the ID %d does not exist.',
                $value,
            ));
        }

        return $asset;
    }
}

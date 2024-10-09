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

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Symfony\Component\Form\DataTransformerInterface;

class PimcoreResourceDataTransformer implements DataTransformerInterface
{
    public function __construct(
        private RepositoryInterface $repository,
    ) {
    }

    public function transform(mixed $value): int|string|null
    {
        if ($value instanceof ResourceInterface) {
            return $value->getId();
        }

        return null;
    }

    public function reverseTransform(mixed $value): ?ResourceInterface
    {
        if ($value) {
            return $this->repository->find($value);
        }

        return null;
    }
}

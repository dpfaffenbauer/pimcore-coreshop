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

namespace CoreShop\Bundle\ResourceBundle\Attribute;

use CoreShop\Component\Resource\Factory\PimcoreFactory;
use CoreShop\Component\Resource\Model\ResourceInterface;

#[\Attribute(\Attribute::TARGET_CLASS)]
final class AsPimcoreModel
{
    public function __construct(
        private string $pimcoreModel,
        private string $type = 'object',
        private string $interface = ResourceInterface::class,
        private string $factory = PimcoreFactory::class,
        private ?string $alias = null,
        private ?string $adminController = null,
        private ?string $repository = null,
        private ?string $installFile = null,
        private ?array $pimcoreController = [],
        private ?array $options = [],
        private ?string $path = null,
        private ?bool $slug = null,
        private array $route = [],
    ) {
    }

    public function getPimcoreModel(): string
    {
        return $this->pimcoreModel;
    }


    public function getType(): string
    {
        return $this->type;
    }

    public function getInterface(): string
    {
        return $this->interface;
    }

    public function getAlias(): ?string
    {
        return $this->alias;
    }

    public function getAdminController(): ?string
    {
        return $this->adminController;
    }

    public function getFactory(): string
    {
        return $this->factory;
    }

    public function getRepository(): ?string
    {
        return $this->repository;
    }
    public function getInstallFile(): ?string
    {
        return $this->installFile;
    }

    public function getPimcoreController(): ?array
    {
        return $this->pimcoreController;
    }

    public function getOptions(): ?array
    {
        return $this->options;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function getSlug(): ?bool
    {
        return $this->slug;
    }

    public function getRoute(): array
    {
        return $this->route;
    }
}
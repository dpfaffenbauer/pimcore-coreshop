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

namespace CoreShop\Component\Resource\Reflection;

use Symfony\Component\Finder\Finder;

final class ClassReflection
{
    public static function getResourcesByPaths(array $paths): iterable
    {
        foreach ($paths as $resourceDirectory) {
            yield from self::getResourcesByPath($resourceDirectory);
        }
    }

    public static function getResourcesByPath(string $path): iterable
    {
        //Silently ignore non-existing directories
        if (is_dir($path) === false) {
            return;
        }

        $finder = new Finder();
        $finder->files()->in($path)->name('*.php')->sortByName(true);

        foreach ($finder as $file) {
            $fileContent = file_get_contents((string) $file->getRealPath());
            if (false === $fileContent) {
                throw new \RuntimeException(sprintf('Unable to read "%s" file', $file->getRealPath()));
            }

            preg_match('/namespace (.+);/', $fileContent, $matches);

            $namespace = $matches[1] ?? null;

            if (!preg_match('/class +([^{ ]+)/', $fileContent, $matches)) {
                // no class found
                continue;
            }

            $className = trim($matches[1]);

            if (null !== $namespace) {
                yield $namespace . '\\' . $className;
            } else {
                yield $className;
            }
        }
    }

    /**
     * @psalm-param class-string $className
     * @psalm-param class-string|null $attributeName
     *
     * @return \ReflectionAttribute[]
     */
    public static function getClassAttributes(string $className, ?string $attributeName = null): array
    {
        $reflectionClass = new \ReflectionClass($className);

        /** @psalm-suppress ArgumentTypeCoercion */
        return $reflectionClass->getAttributes($attributeName);
    }
}
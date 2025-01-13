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

namespace CoreShop\Bundle\OrderBundle\Twig;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

final class ImageToBase64Extension extends AbstractExtension
{
    public function __construct(
        private NormalizerInterface $normalizer,
        private string $kernelProjectDir,
    ) {
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('coreshop_image64', $this->createBase64Image(...)),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('coreshop_image64', $this->createBase64Image(...)),
            new TwigFunction('coreshop_image_path', $this->getImagePath(...)),
        ];
    }

    public function createBase64Image(string $image): string
    {
        return (string) $this->normalizer->normalize(new \SplFileObject($image));
    }

    public function getImagePath(string $image): string
    {
        return $this->kernelProjectDir . '/public' . $image;
    }
}

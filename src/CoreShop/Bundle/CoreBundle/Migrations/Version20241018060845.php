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

namespace CoreShop\Bundle\CoreBundle\Migrations;

use CoreShop\Bundle\FrontendBundle\CoreShopFrontendBundle;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

final class Version20241018060845 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function getDescription(): string
    {
        return 'Enable the CoreShop FrontendBundle in bundles.php';
    }

    public function up(Schema $schema): void
    {
        $this->enableFrontendBundle();
    }

    public function down(Schema $schema): void
    {
        $this->disableFrontendBundle();
    }

    private function enableFrontendBundle(): void
    {
        $file = $this->getConfigFile();
        $registered = $this->load($file);

        $class = CoreShopFrontendBundle::class;
        $bundle = ltrim($class, '\\');

        if (!isset($registered[$bundle])) {
            $registered[$bundle] = ['all' => true];
        }

        $this->dump($file, $registered);
    }

    private function disableFrontendBundle(): void
    {
        $file = $this->getConfigFile();
        $registered = $this->load($file);

        $class = CoreShopFrontendBundle::class;
        $bundle = ltrim($class, '\\');

        if (isset($registered[$bundle])) {
            unset($registered[$bundle]);
        }

        $this->dump($file, $registered);
    }

    private function dump(string $file, array $bundles)
    {
        $contents = $this->buildContents($bundles);

        if (!is_dir(\dirname($file))) {
            if (!mkdir($concurrentDirectory = \dirname($file), 0777, true) && !is_dir($concurrentDirectory)) {
                throw new \RuntimeException(sprintf('Directory "%s" was not created', $concurrentDirectory));
            }
        }

        file_put_contents($file, $contents);

        if (\function_exists('opcache_invalidate')) {
            opcache_invalidate($file);
        }
    }

    private function buildContents(array $bundles): string
    {
        $contents = "<?php\n\nreturn [\n";
        foreach ($bundles as $class => $envs) {
            $contents .= "    $class::class => [";
            foreach ($envs as $env => $value) {
                $booleanValue = var_export($value, true);
                $contents .= "'$env' => $booleanValue, ";
            }
            $contents = substr($contents, 0, -2) . "],\n";
        }
        $contents .= "];\n";

        return $contents;
    }

    private function load(string $file): array
    {
        $bundles = file_exists($file) ? (require $file) : [];
        if (!\is_array($bundles)) {
            $bundles = [];
        }

        return $bundles;
    }

    private function getConfigFile(): string
    {
        return $this->container->getParameter('kernel.project_dir') . '/config/bundles.php';
    }
}

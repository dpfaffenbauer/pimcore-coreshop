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

namespace CoreShop\Bundle\ResourceBundle\Installer;

use CoreShop\Bundle\ResourceBundle\Installer\Configuration\DocumentConfiguration;
use Pimcore\Model\Document;
use Pimcore\Model\Element\Service;
use Pimcore\Model\Site;
use Pimcore\Tool;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Yaml\Yaml;

final class PimcoreDocumentsInstaller implements ResourceInstallerInterface
{
    public function __construct(
        private KernelInterface $kernel,
    ) {
    }

    public function installResources(OutputInterface $output, ?string $applicationName = null, array $options = []): void
    {
        $parameter = $applicationName ? sprintf(
            '%s.pimcore.admin.install.documents',
            $applicationName,
        ) : 'coreshop.all.pimcore.admin.install.documents';

        if ($this->kernel->getContainer()->hasParameter($parameter)) {
            /**
             * @var array $documentFilesToInstall
             */
            $documentFilesToInstall = $this->kernel->getContainer()->getParameter($parameter);
            $docsToInstall = [];

            $progress = new ProgressBar($output);
            $progress->setBarCharacter('<info>░</info>');
            $progress->setEmptyBarCharacter(' ');
            $progress->setProgressCharacter('<comment>░</comment>');
            $progress->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');

            $processor = new Processor();
            $configurationDefinition = new DocumentConfiguration();

            foreach ($documentFilesToInstall as $file) {
                $file = $this->kernel->locateResource($file);

                if (file_exists($file)) {
                    $content = file_get_contents($file);

                    if (!$content) {
                        continue;
                    }

                    $documents = Yaml::parse($content);
                    $documents = $processor->processConfiguration(
                        $configurationDefinition,
                        ['documents' => $documents],
                    );
                    $documents = $documents['documents'];

                    foreach ($documents as $docData) {
                        $docsToInstall[] = $docData;
                    }
                }
            }

            $progress->start(count($docsToInstall));
            $validLanguages = Tool::getValidLanguages();
            $languagesDone = [];

            $sites = new Site\Listing();
            $sites->load();
            $sites = $sites->getSites();
            $rootDocument = null;

            if (count($sites) > 0) {
                /**
                 * @var Site $site
                 */
                $site = $sites[0];
                $rootDocument = $site->getRootDocument();
            }

            if (!$rootDocument instanceof Document) {
                $rootDocument = Document::getById(1);
            }

            foreach ($docsToInstall as $docData) {
                $progress->setMessage(
                    sprintf('Install Document %s/%s', $docData['path'], $docData['key']),
                );

                foreach ($validLanguages as $language) {
                    $languageDocument = Document::getByPath($rootDocument->getRealFullPath() . '/' . $language);

                    if (!$languageDocument instanceof Document) {
                        $languageDocument = new Document\Page();
                        $languageDocument->setParent($rootDocument);
                        $languageDocument->setProperty('language', 'text', $language, false, true);
                        $languageDocument->setKey(Service::getValidKey($language, 'document'));
                        $languageDocument->save();
                    }

                    $doc = $this->installDocument($rootDocument, $language, $docData);

                    if ($doc instanceof Document) {
                        //Link translations
                        foreach ($languagesDone as $doneLanguage) {
                            $translatedDocument = Document::getByPath(
                                $rootDocument->getRealFullPath(
                                ) . '/' . $doneLanguage . '/' . $docData['path'] . '/' . $docData['key'],
                            );

                            if ($translatedDocument) {
                                $service = new Document\Service();
                                $service->addTranslation($doc, $translatedDocument, $doneLanguage);
                            }
                        }
                    }
                }

                $progress->advance();
            }

            $progress->finish();
            $progress->clear();

            $output->writeln('  - <info>Documents have been installed successfully</info>');
        }
    }

    private function installDocument(Document $rootDocument, string $language, array $properties): ?Document
    {
        $path = $rootDocument->getRealFullPath() . '/' . $language . '/' . $properties['path'] . '/' . $properties['key'];

        if (!Document\Service::pathExists($path)) {
            $class = 'Pimcore\\Model\\Document\\' . ucfirst($properties['type']);

            /**
             * @psalm-suppress InternalMethod
             */
            if (\Pimcore\Tool::classExists($class)) {
                /**
                 * @var Document $document
                 *
                 * @psalm-var class-string $class
                 */
                $document = new $class();
                $document->setParent(
                    Document::getByPath($rootDocument->getRealFullPath() . '/' . $language . '/' . $properties['path']),
                );

                $document->setKey(Service::getValidKey($properties['key'], 'document'));

                if ($document instanceof Document\PageSnippet) {
                    if ($document instanceof Document\Page && isset($properties['title'])) {
                        $document->setTitle($properties['title']);
                    }

                    if (isset($properties['controller'])) {
                        $document->setController($properties['controller']);
                    }
                    if (isset($properties['template'])) {
                        $document->setTemplate($properties['template']);
                    }

                    if (array_key_exists('content', $properties)) {
                        foreach ($properties['content'] as $fieldLanguage => $fields) {
                            if ($fieldLanguage !== $language) {
                                continue;
                            }

                            foreach ($fields as $key => $field) {
                                $type = $field['type'];
                                $content = null;

                                if (array_key_exists('value', $field)) {
                                    $content = $field['value'];
                                }

                                if (!empty($content)) {
                                    if ($type === 'objectProperty') {
                                        $document->setValue($key, $content);
                                    } else {
                                        $document->setRawEditable($key, $type, $content);
                                    }
                                }
                            }
                        }
                    }

                    $document->setMissingRequiredEditable(false);
                }

                $document->setPublished(true);
                $document->save();

                return $document;
            }
        }

        return null;
    }
}

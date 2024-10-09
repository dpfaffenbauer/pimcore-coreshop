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

namespace CoreShop\Bundle\TestBundle\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Bundle\NewsletterBundle\Model\Document\Newsletter;
use Pimcore\Model\Document;

final class DocumentContext implements Context
{
    public function __construct(
        protected SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Given /^there is a document-page at path "([^"]+)" with key "([^"]+)"$/
     */
    public function theSiteHasADocumentAtPath(string $path, string $key): void
    {
        $document = $this->createDocumentByType('page', $path, $key);

        $document->setProperty('language', 'text', 'de', false, true);

        $this->saveDocument($document);
    }

    public function createDocumentByType(string $type, string $path, string $key): Document
    {
        $classForType = match ($type) {
            'page' => Document\Page::class,
            'snippet' => Document\Snippet::class,
            'link' => Document\Link::class,
            'hardlink' => Document\Hardlink::class,
            'folder' => Document\Folder::class,
            'email' => Document\Email::class,
            'newsletter' => Newsletter::class,
            default => throw new \InvalidArgumentException($type . ' is not valid')
        };

        /**
         * @var Document $document
         */
        $document = new $classForType();
        $document->setParent(Document\Service::createFolderByPath($path));
        $document->setKey(Document\Service::getValidKey($key, 'document'));

        return $document;
    }

    /**
     * @Given /^the (documents) controller is "([^"]+)"$/
     * @Given /^the (document "([^"]+)") controller is "([^"]+)"$/
     */
    public function theDocumentsControllerIs(Document\PageSnippet $document, string $controller): void
    {
        $document->setController($controller);

        $this->saveDocument($document);
    }

    /**
     * @Given /^the (documents) template is "([^"]+)"$/
     * @Given /^the (document "([^"]+)") template is "([^"]+)"$/
     */
    public function theDocumentsTemplateIs(Document\PageSnippet $document, string $template): void
    {
        $document->setTemplate($template);

        $this->saveDocument($document);
    }

    /**
     * @Given /^the (documents) pretty-url is "([^"]+)"$/
     * @Given /^the (document "([^"]+)") pretty-url is "([^"]+)"$/
     */
    public function theDocumentsPrettyUrl(Document\Page $document, string $prettyUrl): void
    {
        $document->setPrettyUrl($prettyUrl);

        $this->saveDocument($document);
    }

    /**
     * @Given /^the (document) has a editable with name "([^"]+)"), type "([^"]+)") and data "([^"]+)")$/
     * @Given /^the (document "([^"]+)") has a editable with name "([^"]+)"), type "([^"]+)") and data "([^"]+)")$/
     */
    public function theDocumentHasEditable(Document\PageSnippet $document, string $name, string $type, string $data)
    {
        /**
         * @psalm-suppress InternalMethod
         */
        $document->setRawEditable($name, $type, json_decode($data, true, 512, \JSON_THROW_ON_ERROR));

        $this->saveDocument($document);

        $this->sharedStorage->set('document-editable', $document->getEditable($name));
    }

    private function saveDocument(Document $document)
    {
        $document->save();
        $this->sharedStorage->set('document', $document);
    }
}

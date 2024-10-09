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
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Bundle\NewsletterBundle\Model\Document\Newsletter;
use Pimcore\Model\Document;
use Webmozart\Assert\Assert;

final class DocumentContext implements Context
{
    public function __construct(
        protected SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Transform /^document "([^"]+)"$/
     */
    public function getDocumentByFullPath(string $fullPath): Document
    {
        $document = Document::getByPath($fullPath);

        Assert::isInstanceOf($document, Document::class);

        return $document;
    }

    /**
     * @Transform /^document-page "([^"]+)"$/
     */
    public function getDocumentPageByFullPath(string $fullPath): Document\Page
    {
        $document = Document\Page::getByPath($fullPath);

        Assert::isInstanceOf($document, Document\Page::class);

        return $document;
    }

    /**
     * @Transform /^document-page-snippet "([^"]+)"$/
     */
    public function getDocumentPageSnippetByFullPath(string $fullPath): Document\PageSnippet
    {
        $document = Document\PageSnippet::getByPath($fullPath);

        Assert::isInstanceOf($document, Document\PageSnippet::class);

        return $document;
    }

    /**
     * @Transform /^document-snippet "([^"]+)"$/
     */
    public function getDocumentSnippetByFullPath(string $fullPath): Document\Snippet
    {
        $document = Document\Snippet::getByPath($fullPath);

        Assert::isInstanceOf($document, Document\Snippet::class);

        return $document;
    }

    /**
     * @Transform /^document-link "([^"]+)"$/
     */
    public function getDocumentLinkByFullPath(string $fullPath): Document\Link
    {
        $document = Document\Link::getByPath($fullPath);

        Assert::isInstanceOf($document, Document\Link::class);

        return $document;
    }

    /**
     * @Transform /^document-hardlink "([^"]+)"$/
     */
    public function getDocumentHardlinkByFullPath(string $fullPath): Document\Hardlink
    {
        $document = Document\Hardlink::getByPath($fullPath);

        Assert::isInstanceOf($document, Document\Hardlink::class);

        return $document;
    }

    /**
     * @Transform /^document-folder "([^"]+)"$/
     */
    public function getDocumentFolderByFullPath(string $fullPath): Document\Folder
    {
        $document = Document\Folder::getByPath($fullPath);

        Assert::isInstanceOf($document, Document\Folder::class);

        return $document;
    }

    /**
     * @Transform /^document-email "([^"]+)"$/
     */
    public function getDocumentEmailByFullPath(string $fullPath): Document\Email
    {
        $document = Document\Email::getByPath($fullPath);

        Assert::isInstanceOf($document, Document\Email::class);

        return $document;
    }

    /**
     * @Transform /^document-newsletter "([^"]+)"$/
     */
    public function getDocumentNewsletterByFullPath(string $fullPath): Newsletter
    {
        $document = Newsletter::getByPath($fullPath);

        Assert::isInstanceOf($document, Newsletter::class);

        return $document;
    }

    /**
     * @Transform /^document/
     */
    public function document(): Document
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document::class);

        return $document;
    }

    /**
     * @Transform /^document-page-snippet/
     */
    public function documentPageSnippet(): Document\PageSnippet
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document\PageSnippet::class);

        return $document;
    }

    /**
     * @Transform /^document-snippet/
     */
    public function documentSnippet(): Document\Snippet
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document\Snippet::class);

        return $document;
    }

    /**
     * @Transform /^document-page/
     */
    public function documentPage(): Document\Page
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document\Page::class);

        return $document;
    }

    /**
     * @Transform /^document-link/
     */
    public function documentLink(): Document\Link
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document\Link::class);

        return $document;
    }

    /**
     * @Transform /^document-hardlink/
     */
    public function documentHardLink(): Document\Hardlink
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document\Hardlink::class);

        return $document;
    }

    /**
     * @Transform /^document-folder/
     */
    public function documentFolder(): Document\Folder
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document\Folder::class);

        return $document;
    }

    /**
     * @Transform /^document-newsletter/
     */
    public function documentNewsletter(): Newsletter
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Newsletter::class);

        return $document;
    }

    /**
     * @Transform /^document-email/
     */
    public function documentEmail(): Document\Email
    {
        $document = $this->sharedStorage->get('document');

        Assert::isInstanceOf($document, Document\Email::class);

        return $document;
    }
}

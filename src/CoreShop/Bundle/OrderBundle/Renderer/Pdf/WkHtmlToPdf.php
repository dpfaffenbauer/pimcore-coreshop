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

namespace CoreShop\Bundle\OrderBundle\Renderer\Pdf;

use Pimcore\Tool\Console;
use Symfony\Component\Process\Process;

/**
 * @deprecated Deprecated since CoreShop 4.1, to be removed in CoreShop 5.0. No replacement available, use Pimcore's Web2Print Renderer instead.
 *
 * @psalm-suppress DeprecatedInterface
 */
final class WkHtmlToPdf implements PdfRendererInterface
{
    public function __construct(
        private string $kernelCacheDir,
        private string $kernelRootDir,
    ) {
    }

    public function fromString(string $string, string $header = '', string $footer = '', array $config = []): string
    {
        trigger_deprecation(
            'coreshop/order-bundle',
            '4.1',
            'The "%s" class is deprecated and will be removed in CoreShop 5.0. No replacement available, use Pimcore\'s Web2Print Renderer instead.',
            self::class,
        );

        $bodyHtml = $this->createHtmlFile($string);
        $headerHtml = $this->createHtmlFile($header);
        $footerHtml = $this->createHtmlFile($footer);

        if (!is_array($config['options'])) {
            $config['options'] = [];
        }

        if ($headerHtml) {
            $config['options']['--header-html'] = $headerHtml;
        }

        if ($footerHtml) {
            $config['options']['--footer-html'] = $footerHtml;
        }

        $pdfContent = null;

        try {
            $pdfContent = $this->convert($bodyHtml, $config);
        } catch (\Exception $e) {
            $this->unlinkFile($bodyHtml);
            $this->unlinkFile($headerHtml);
            $this->unlinkFile($footerHtml);

            throw new \Exception('error while converting pdf. message was: ' . $e->getMessage(), 0, $e);
        }

        $this->unlinkFile($bodyHtml);
        $this->unlinkFile($headerHtml);
        $this->unlinkFile($footerHtml);

        return $pdfContent;
    }

    /**
     * Creates an Temporary HTML File.
     *
     * @param string $string
     */
    private function createHtmlFile($string): ?string
    {
        if ($string) {
            $tmpHtmlFile = $this->kernelCacheDir . '/' . uniqid() . '.htm';
            file_put_contents($tmpHtmlFile, $this->replaceUrls($string));

            return $tmpHtmlFile;
        }

        return null;
    }

    /**
     * @param string $string
     */
    private function replaceUrls($string): string
    {
        $hostUrl = $this->kernelRootDir . '/public';
        $replacePrefix = '';

        //matches all links
        preg_match_all(
            "@(href|src)\s*=[\"']([^(http|mailto|javascript|data:|#)].*?(css|jpe?g|gif|png)?)[\"']@is",
            $string,
            $matches,
        );
        if (!empty($matches[0])) {
            foreach ($matches[0] as $key => $value) {
                $path = $matches[2][$key];

                if (str_starts_with($path, '//')) {
                    $absolutePath = 'http:' . $path;
                } elseif (str_starts_with($path, '/')) {
                    $absolutePath = preg_replace('@^' . $replacePrefix . '/@', '/', $path);
                    $absolutePath = $hostUrl . $absolutePath;
                } else {
                    $absolutePath = $hostUrl . "/$path";
                    if ($path[0] == '?') {
                        $absolutePath = $hostUrl . $path;
                    }
                    $netUrl = new \Net_URL2($absolutePath);
                    $absolutePath = $netUrl->getNormalizedURL();
                }

                $path = preg_quote($path);
                $string = preg_replace("!([\"'])$path([\"'])!is", '\\1' . $absolutePath . '\\2', $string);
            }
        }

        preg_match_all("@srcset\s*=[\"'](.*?)[\"']@is", $string, $matches);
        foreach ($matches[1] as $i => $value) {
            $parts = explode(',', $value);
            foreach ($parts as $key => $v) {
                $parts[$key] = $hostUrl . trim($v);
            }
            $s = ' srcset="' . implode(', ', $parts) . '" ';
            if ($matches[0][$i]) {
                $string = str_replace($matches[0][$i], $s, $string);
            }
        }

        return $string;
    }

    /**
     * Converts URL to pdf.
     *
     * @param string $httpSource
     * @param array $config
     *
     * @return string PDF-Content
     *
     * @throws \Exception
     */
    private function convert($httpSource, $config = []): string
    {
        $tmpPdfFile = $this->kernelCacheDir . '/' . uniqid() . '.pdf';
        $options = ' ';
        $optionConfig = [];

        if (is_array($config['options'])) {
            foreach ($config['options'] as $argument => $value) {
                // there is no value only the option
                if (is_numeric($argument)) {
                    $optionConfig[] = $value;
                } else {
                    $optionConfig[] = $argument . ' ' . $value;
                }
            }

            $options .= implode(' ', $optionConfig);
        }

        if (isset($config['bin'])) {
            $wkHtmlTopPfBinary = $config['bin'];
        } else {
            $wkHtmlTopPfBinary = $this->getWkHtmlToPdfBinary();
        }

        if (!$wkHtmlTopPfBinary) {
            throw new \Exception('wkhtmltopdf binary not found. please check your server configuration');
        }

        // use xvfb if possible
        if ($xvfb = self::getXvfbBinary()) {
            $command = $xvfb . ' --auto-servernum --server-args="-screen 0, 1280x1024x24" ' . $wkHtmlTopPfBinary . ' --use-xserver ' . $options;
        } else {
            $command = $wkHtmlTopPfBinary . $options;
        }

        $process = Process::fromShellCommandline($command . ' ' . $httpSource . ' ' . $tmpPdfFile);
        $process->run();

        if (!file_exists($tmpPdfFile)) {
            throw new \Exception(
                sprintf(
                    'wkhtmltopdf pdf conversion failed. This could be a command error. Executed command was: "%s"',
                    $process->getCommandLine(),
                ),
            );
        }

        $pdfContent = file_get_contents($tmpPdfFile);

        // remove temp pdf file
        $this->unlinkFile($tmpPdfFile);

        return $pdfContent;
    }

    private function unlinkFile(?string $file): void
    {
        if ($file === null) {
            return;
        }

        if (!file_exists($file)) {
            return;
        }

        unlink($file);
    }

    private function getWkHtmlToPdfBinary(): string
    {
        return (string) Console::getExecutable('wkhtmltopdf', true);
    }

    private function getXvfbBinary(): string
    {
        return (string) Console::getExecutable('xvfb-run');
    }
}

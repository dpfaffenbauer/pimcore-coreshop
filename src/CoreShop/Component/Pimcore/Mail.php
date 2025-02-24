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

namespace CoreShop\Component\Pimcore;

class Mail extends \Pimcore\Mail
{
    public function addRecipients(array|string|null $recipients = null)
    {
        $toRecipients = [];

        if ($recipients) {
            if (is_array($recipients)) {
                foreach ($recipients as $recipient) {
                    if (is_array($recipient)) {
                        $toRecipients[] = [$recipient[0], $recipient[1]];
                    } else {
                        $multiRecipients = array_filter(explode(';', $recipient));
                        foreach ($multiRecipients as $multiRecipient) {
                            $toRecipients[] = [$multiRecipient, ''];
                        }
                    }
                }
            } else {
                $multiRecipients = array_filter(explode(';', $recipients));
                foreach ($multiRecipients as $multiRecipient) {
                    $toRecipients[] = [$multiRecipient, ''];
                }
            }
        }

        foreach ($toRecipients as $recipient) {
            $this->addTo($recipient[0], $recipient[1]);
        }
    }
}

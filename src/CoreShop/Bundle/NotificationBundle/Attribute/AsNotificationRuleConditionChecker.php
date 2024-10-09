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

namespace CoreShop\Bundle\NotificationBundle\Attribute;

#[\Attribute(\Attribute::TARGET_CLASS)]
final class AsNotificationRuleConditionChecker
{
    public function __construct(
        private ?string $type = null,
        private ?string $notificationType = null,
        private ?string $formType = null,
    ) {
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function getNotificationType(): ?string
    {
        return $this->notificationType;
    }
    
    public function getFormType(): ?string
    {
        return $this->formType;
    }
}

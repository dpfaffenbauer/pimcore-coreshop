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

namespace CoreShop\Component\Core\Model;

use CoreShop\Component\Address\Model\StateInterface;
use CoreShop\Component\Taxation\Model\TaxRuleInterface as BaseTaxRuleInterface;

interface TaxRuleInterface extends BaseTaxRuleInterface
{
    /**
     * @return CountryInterface
     */
    public function getCountry();

    public function setCountry(?CountryInterface $country = null);

    /**
     * @return StateInterface
     */
    public function getState();

    public function setState(?StateInterface $state = null);
}

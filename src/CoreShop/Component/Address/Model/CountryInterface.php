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

namespace CoreShop\Component\Address\Model;

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Model\TimestampableInterface;
use CoreShop\Component\Resource\Model\ToggleableInterface;
use CoreShop\Component\Resource\Model\TranslatableInterface;

interface CountryInterface extends
    ResourceInterface,
    TranslatableInterface,
    TimestampableInterface,
    ToggleableInterface
{
    public function getId(): ?int;

    /**
     * @return string
     */
    public function getIsoCode();

    /**
     * @param string $isoCode
     */
    public function setIsoCode($isoCode);

    /**
     * @param string $language
     *
     * @return mixed
     */
    public function getName(?string $language = null);

    /**
     * @param string $name
     * @param string $language
     *
     * @return mixed
     */
    public function setName($name, ?string $language = null);

    /**
     * @return ZoneInterface
     */
    public function getZone();

    public function setZone(?ZoneInterface $zone = null);

    /**
     * @return string
     */
    public function getZoneName();

    /**
     * @return string
     */
    public function getAddressFormat();

    /**
     * @param string $addressFormat
     */
    public function setAddressFormat($addressFormat);

    /**
     * @return array
     */
    public function getSalutations();

    /**
     * @param array $salutations
     */
    public function setSalutations($salutations);
}

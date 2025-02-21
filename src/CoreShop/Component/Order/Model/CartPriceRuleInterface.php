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

namespace CoreShop\Component\Order\Model;

use CoreShop\Component\Resource\Model\TranslatableInterface;
use CoreShop\Component\Rule\Model\RuleInterface;
use Doctrine\Common\Collections\Collection;

interface CartPriceRuleInterface extends RuleInterface, TranslatableInterface
{
    public function getId(): ?int;

    /**
     * @return string
     */
    public function getLabel(?string $language = null);

    public function setLabel(string $label, ?string $language = null);

    /**
     * @return string
     */
    public function getDescription();

    /**
     * @param string $description
     */
    public function setDescription($description);

    /**
     * @return bool
     */
    public function getIsVoucherRule();

    /**
     * @param bool $isVoucherRule
     */
    public function setIsVoucherRule($isVoucherRule);

    /**
     * @return Collection|CartPriceRuleVoucherCodeInterface[]
     */
    public function getVoucherCodes();

    /**
     * @return bool
     */
    public function hasVoucherCodes();

    public function addVoucherCode(CartPriceRuleVoucherCodeInterface $cartPriceRuleVoucherCode);

    public function removeVoucherCode(CartPriceRuleVoucherCodeInterface $cartPriceRuleVoucherCode);

    /**
     * @return bool
     */
    public function hasVoucherCode(CartPriceRuleVoucherCodeInterface $cartPriceRuleVoucherCode);

    public function getPriority(): int;

    public function setPriority(int $priority): void;
}

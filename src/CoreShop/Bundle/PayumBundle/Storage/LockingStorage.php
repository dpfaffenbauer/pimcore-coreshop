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

namespace CoreShop\Bundle\PayumBundle\Storage;

use CoreShop\Component\Payment\Model\PaymentInterface;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManager;
use Payum\Core\Bridge\Doctrine\Storage\DoctrineStorage;

class LockingStorage extends DoctrineStorage
{
    protected function doFind($id)
    {
        $objectManager = $this->objectManager;
        /** @psalm-var class-string $modelClass */
        $modelClass = $this->modelClass;

        if ($objectManager instanceof EntityManager) {
            $implements = class_implements($modelClass) ?: [];

            if (
                in_array(PaymentInterface::class, $implements, true) &&
                $objectManager->getConnection()->isTransactionActive()
            ) {
                $objectManager->getConnection()->setAutoCommit(false);

                return $objectManager->find($modelClass, $id, LockMode::PESSIMISTIC_WRITE);
            }
        }

        return parent::doFind($id);
    }
}

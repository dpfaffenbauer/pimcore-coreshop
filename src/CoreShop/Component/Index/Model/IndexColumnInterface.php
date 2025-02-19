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

namespace CoreShop\Component\Index\Model;

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Model\TimestampableInterface;

interface IndexColumnInterface extends ResourceInterface, TimestampableInterface
{
    /**
     * Field Type Integer for Index.
     */
    public const FIELD_TYPE_INTEGER = 'INTEGER';

    /**
     * Field Type Double for Index.
     */
    public const FIELD_TYPE_DOUBLE = 'DOUBLE';

    /**
     * Field Type String for Index.
     */
    public const FIELD_TYPE_STRING = 'STRING';

    /**
     * Field Type Text for Index.
     */
    public const FIELD_TYPE_TEXT = 'TEXT';

    /**
     * Field Type Boolean for Index.
     */
    public const FIELD_TYPE_BOOLEAN = 'BOOLEAN';

    /**
     * Field Type Date for Index.
     */
    public const FIELD_TYPE_DATE = 'DATE';

    public function getId(): ?int;

    /**
     * @return IndexInterface
     */
    public function getIndex();

    public function setIndex(?IndexInterface $index = null);

    /**
     * @return string
     */
    public function getObjectKey();

    /**
     * @param string $key
     */
    public function setObjectKey($key);

    /**
     * @return string
     */
    public function getName();

    /**
     * @param string $name
     */
    public function setName($name);

    /**
     * @return string
     */
    public function getType();

    /**
     * @param string $type
     */
    public function setType($type);

    /**
     * @return string
     */
    public function getObjectType();

    /**
     * @param string $objectType
     */
    public function setObjectType($objectType);

    /**
     * @return bool
     */
    public function hasGetter();

    /**
     * @return string
     */
    public function getGetter();

    /**
     * @param string $getter
     */
    public function setGetter($getter);

    /**
     * @return array
     */
    public function getGetterConfig();

    /**
     * @param array $getterConfig
     */
    public function setGetterConfig($getterConfig);

    /**
     * @return string
     */
    public function getDataType();

    /**
     * @param string $dataType
     */
    public function setDataType($dataType);

    /**
     * @return bool
     */
    public function hasInterpreter();

    /**
     * @return string
     */
    public function getInterpreter();

    /**
     * @param string $interpreter
     */
    public function setInterpreter($interpreter);

    /**
     * @return array
     */
    public function getInterpreterConfig();

    /**
     * @param array $interpreterConfig
     */
    public function setInterpreterConfig($interpreterConfig);

    /**
     * @return string
     */
    public function getColumnType();

    /**
     * @param string $columnType
     */
    public function setColumnType($columnType);

    /**
     * @return array
     */
    public function getConfiguration();

    /**
     * @param array $configuration
     */
    public function setConfiguration($configuration);
}

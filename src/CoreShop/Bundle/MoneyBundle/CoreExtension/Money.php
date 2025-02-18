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

namespace CoreShop\Bundle\MoneyBundle\CoreExtension;

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\Element\ValidationException;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement, MissingConstructor
 */
class Money extends DataObject\ClassDefinition\Data implements
    Data\ResourcePersistenceAwareInterface,
    Data\QueryResourcePersistenceAwareInterface
{
    public string $fieldtype = 'coreShopMoney';

    /**
     * @var int
     */
    public $width;

    /**
     * @var int
     */
    public $defaultValue;

    /**
     * Type for the generated phpdoc.
     *
     * @var string
     */
    public $phpdocType = 'int';

    /**
     * @var float
     */
    public $minValue;

    /**
     * @var float
     */
    public $maxValue;

    /**
     * @var bool
     */
    public $nullable = false;

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function getParameterTypeDeclaration(): ?string
    {
        return ($this->nullable ? '?' : '') . 'int';
    }

    public function getReturnTypeDeclaration(): ?string
    {
        return ($this->nullable ? '?' : '') . 'int';
    }

    public function getPhpdocInputType(): ?string
    {
        return ($this->nullable ? '?' : '') . 'int';
    }

    public function getPhpdocReturnType(): ?string
    {
        return ($this->nullable ? '?' : '') . 'int';
    }

    /**
     * @return int
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @param int $width
     *
     * @return $this
     */
    public function setWidth($width)
    {
        $this->width = $this->getAsIntegerCast($width);

        return $this;
    }

    /**
     * @return int
     */
    public function getDefaultValue()
    {
        if ($this->defaultValue !== null) {
            return $this->toNumeric($this->defaultValue);
        }

        return 0;
    }

    /**
     * @param int $defaultValue
     *
     * @return $this
     */
    public function setDefaultValue($defaultValue)
    {
        if (strlen((string) $defaultValue) > 0) {
            $this->defaultValue = $defaultValue;
        }

        return $this;
    }

    /**
     * @param float $maxValue
     */
    public function setMaxValue($maxValue)
    {
        $this->maxValue = $maxValue;
    }

    /**
     * @return float
     */
    public function getMaxValue()
    {
        return $this->maxValue;
    }

    /**
     * @param float $minValue
     */
    public function setMinValue($minValue)
    {
        $this->minValue = $minValue;
    }

    /**
     * @return float
     */
    public function getMinValue()
    {
        return $this->minValue;
    }

    public function getNullable(): bool
    {
        return $this->nullable;
    }

    public function setNullable(bool $nullable): void
    {
        $this->nullable = $nullable;
    }

    public function getColumnType(): string
    {
        return 'bigint(20)';
    }

    public function getQueryColumnType(): string
    {
        return 'bigint(20)';
    }

    public function getDataForResource(mixed $data, Concrete $object = null, array $params = []): mixed
    {
        if (is_numeric($data) && !is_int($data)) {
            $data = (int) $data;
        }

        if (is_int($data)) {
            return $data;
        }

        return $this->nullable ? null : 0;
    }

    public function preGetData($object)
    {
        /**
         * @var Concrete $object
         */
        $data = $object->getObjectVar($this->getName());

        if (null === $data) {
            return $this->nullable ? null : 0;
        }

        if (!is_int($data)) {
            return $this->nullable ? null : 0;
        }

        return $data;
    }

    public function getGetterCode(DataObject\ClassDefinition|DataObject\Objectbrick\Definition|DataObject\Fieldcollection\Definition $class): string
    {
        $key = $this->getName();
        $code = '';

        $code .= '/**' . "\n";
        $code .= '* Get ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @return ' . $this->getPhpdocReturnType() . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function get' . ucfirst($key) . ' (): ' . ($this->nullable ? '?' : '') . "int {\n";

        $code .= $this->getPreGetValueHookCode($key);

        if (method_exists($this, 'preGetData')) {
            $code .= "\t" . '$data = $this->getClass()->getFieldDefinition("' . $key . '")->preGetData($this);' . "\n\n";
        } else {
            $code .= "\t" . '$data = $this->' . $key . ";\n\n";
        }

        // insert this line if inheritance from parent objects is allowed
        if ($class instanceof DataObject\ClassDefinition && $class->getAllowInherit() && $this->supportsInheritance()) {
            $code .= "\t" . 'if(\Pimcore\Model\DataObject::doGetInheritedValues() && $this->getClass()->getFieldDefinition("' . $key . '")->isEmpty($data)) {' . "\n";
            $code .= "\t\t" . 'try {' . "\n";
            $code .= "\t\t\t" . 'return $this->getValueFromParent("' . $key . '");' . "\n";
            $code .= "\t\t" . '} catch (InheritanceParentNotFoundException $e) {' . "\n";
            $code .= "\t\t\t" . '// no data from parent available, continue ... ' . "\n";
            $code .= "\t\t" . '}' . "\n";
            $code .= "\t" . '}' . "\n\n";
        }

        $code .= "\t" . 'if ($data instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField) {' . "\n";
        $code .= "\t\t" . '    return $data->getPlain();' . "\n";
        $code .= "\t" . '}' . "\n\n";

        $code .= "\treturn " . '$data' . ";\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getSetterCode(DataObject\ClassDefinition|DataObject\Objectbrick\Definition|DataObject\Fieldcollection\Definition $class): string
    {
        $returnType = 'mixed';

        switch ($class::class) {
            case DataObject\Objectbrick\Definition::class:
                $returnType = '\\Pimcore\\Model\\DataObject\\Objectbrick\\Data\\' . ucfirst($class->getKey());

                break;
            case DataObject\Fieldcollection\Definition::class:
                $returnType = '\\Pimcore\\Model\\DataObject\\FieldCollection\\Data\\' . ucfirst($class->getKey());

                break;
            case DataObject\ClassDefinition::class:
                $returnType = '\\Pimcore\\Model\\DataObject\\FieldCollection\\Data\\' . ucfirst($class->getName());

                break;
        }

        $key = $this->getName();
        $code = '';

        $code .= '/**' . "\n";
        $code .= '* Set ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @param ' . $this->getPhpdocReturnType() . ' $' . $key . "\n";
        $code .= '* @return ' . $returnType . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function set' . ucfirst($key) . ' (' . ($this->nullable ? '?' : '') . 'int ' . '$' . $key . ") {\n";
        $code .= "\t" . '$fd = $this->getClass()->getFieldDefinition("' . $key . '");' . "\n";

        if ($this instanceof DataObject\ClassDefinition\Data\EncryptedField) {
            if ($this->getDelegate()) {
                $code .= "\t" . '$encryptedFd = $this->getClass()->getFieldDefinition("' . $key . '");' . "\n";
                $code .= "\t" . '$delegate = $encryptedFd->getDelegate();' . "\n";
                $code .= "\t" . 'if ($delegate && !($' . $key . ' instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField)) {' . "\n";
                $code .= "\t\t" . '$' . $key . ' = new \\Pimcore\\Model\\DataObject\\Data\\EncryptedField($delegate, $' . $key . ');' . "\n";
                $code .= "\t" . '}' . "\n";
            }
        }

        if ($this->supportsDirtyDetection()) {
            $code .= "\t" . '$currentData = $this->get' . ucfirst($this->getName()) . '();' . "\n";
            $code .= "\t" . '$isEqual = $fd->isEqual($currentData, $' . $key . ');' . "\n";
            $code .= "\t" . 'if (!$isEqual) {' . "\n";
            $code .= "\t\t" . '$this->markFieldDirty("' . $key . '", true);' . "\n";
            $code .= "\t" . '}' . "\n";
        }

        if (method_exists($this, 'preSetData')) {
            $code .= "\t" . '$this->' . $key . ' = ' . '$fd->preSetData($this, $' . $key . ');' . "\n";
        } else {
            $code .= "\t" . '$this->' . $key . ' = ' . '$' . $key . ";\n";
        }

        $code .= "\t" . 'return $this;' . "\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getGetterCodeObjectbrick(DataObject\Objectbrick\Definition $brickClass): string
    {
        $key = $this->getName();
        $code = '';
        $code .= '/**' . "\n";
        $code .= '* Get ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @return ' . $this->getPhpdocReturnType() . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function get' . ucfirst($key) . ' (): ' . ($this->nullable ? '?' : '') . " {\n";

        if (method_exists($this, 'preGetData')) {
            $code .= "\t" . '$data = $this->getDefinition()->getFieldDefinition("' . $key . '")->preGetData($this);' . "\n";
        } else {
            $code .= "\t" . '$data = $this->' . $key . ";\n";
        }

        if ($this->supportsInheritance()) {
            $code .= "\t" . 'if(\Pimcore\Model\DataObject::doGetInheritedValues($this->getObject()) && $this->getDefinition()->getFieldDefinition("' . $key . '")->isEmpty($data)) {' . "\n";
            $code .= "\t\t" . 'try {' . "\n";
            $code .= "\t\t\t" . 'return $this->getValueFromParent("' . $key . '");' . "\n";
            $code .= "\t\t" . '} catch (InheritanceParentNotFoundException $e) {' . "\n";
            $code .= "\t\t\t" . '// no data from parent available, continue ... ' . "\n";
            $code .= "\t\t" . '}' . "\n";
            $code .= "\t" . '}' . "\n";
        }

        $code .= "\t" . 'if ($data instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField) {' . "\n";
        $code .= "\t\t" . 'return $data->getPlain();' . "\n";
        $code .= "\t" . '}' . "\n";

        $code .= "\t return " . '$data' . ";\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getSetterCodeObjectbrick(DataObject\Objectbrick\Definition $brickClass): string
    {
        $key = $this->getName();

        $code = '';
        $code .= '/**' . "\n";
        $code .= '* Set ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @param ' . $this->getPhpdocReturnType() . ' $' . $key . "\n";
        $code .= '* @return \\Pimcore\\Model\\DataObject\\Objectbrick\\Data\\' . ucfirst($brickClass->getKey()) . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function set' . ucfirst($key) . ' (' . ($this->nullable ? '?' : '') . 'int ' . '$' . $key . ") {\n";
        $code .= "\t" . '$fd = $this->getDefinition()->getFieldDefinition("' . $key . '");' . "\n";

        if ($this instanceof DataObject\ClassDefinition\Data\EncryptedField) {
            if ($this->getDelegate()) {
                $code .= "\t" . '$encryptedFd = $this->getDefinition()->getFieldDefinition("' . $key . '");' . "\n";
                $code .= "\t" . '$delegate = $encryptedFd->getDelegate();' . "\n";
                $code .= "\t" . 'if ($delegate && !($' . $key . ' instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField)) {' . "\n";
                $code .= "\t\t" . '$' . $key . ' = new \\Pimcore\\Model\\DataObject\\Data\\EncryptedField($delegate, $' . $key . ');' . "\n";
                $code .= "\t" . '}' . "\n";
            }
        }

        if ($this->supportsDirtyDetection()) {
            $code .= "\t" . '$currentData = $this->get' . ucfirst($this->getName()) . '();' . "\n";
            $code .= "\t" . '$isEqual = $fd->isEqual($currentData, $' . $key . ');' . "\n";
            $code .= "\t" . 'if (!$isEqual) {' . "\n";
            $code .= "\t\t" . '$this->markFieldDirty("' . $key . '", true);' . "\n";
            $code .= "\t" . '}' . "\n";
        }

        if (method_exists($this, 'preSetData')) {
            $code .= "\t" . '$this->' . $key . ' = ' . '$fd->preSetData($this, $' . $key . ');' . "\n";
        } else {
            $code .= "\t" . '$this->' . $key . ' = ' . '$' . $key . ";\n";
        }

        $code .= "\t" . 'return $this;' . "\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getGetterCodeFieldcollection(DataObject\Fieldcollection\Definition $fieldcollectionDefinition): string
    {
        $key = $this->getName();

        $code = '';
        $code .= '/**' . "\n";
        $code .= '* Get ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @return ' . $this->getPhpdocReturnType() . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function get' . ucfirst($key) . ' (): ' . ($this->nullable ? '?' : '') . "int {\n";

        if (method_exists($this, 'preGetData')) {
            $code .= "\t" . '$container = $this;' . "\n";
            $code .= "\t" . '$fd = $this->getDefinition()->getFieldDefinition("' . $key . '");' . "\n";
            $code .= "\t" . '$data = $fd->preGetData($container);' . "\n";
        } else {
            $code .= "\t" . '$data = $this->' . $key . ";\n";
        }

        $code .= "\t" . 'if ($data instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField) {' . "\n";
        $code .= "\t\t" . '    return $data->getPlain();' . "\n";
        $code .= "\t" . '}' . "\n";

        $code .= "\t return " . '$data' . ";\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getSetterCodeFieldcollection(DataObject\Fieldcollection\Definition $fieldcollectionDefinition): string
    {
        $key = $this->getName();
        $code = '';

        $code .= '/**' . "\n";
        $code .= '* Set ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @param ' . $this->getPhpdocReturnType() . ' $' . $key . "\n";
        $code .= '* @return \\Pimcore\\Model\\DataObject\\Fieldcollection\\Data\\' . ucfirst($fieldcollectionDefinition->getKey()) . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function set' . ucfirst($key) . ' (' . ($this->nullable ? '?' : '') . 'int ' . '$' . $key . ") {\n";
        $code .= "\t" . '$fd = $this->getDefinition()->getFieldDefinition("' . $key . '");' . "\n";

        if ($this instanceof DataObject\ClassDefinition\Data\EncryptedField) {
            if ($this->getDelegate()) {
                $code .= "\t" . '$encryptedFd = $this->getDefinition()->getFieldDefinition("' . $key . '");' . "\n";
                $code .= "\t" . '$delegate = $encryptedFd->getDelegate();' . "\n";
                $code .= "\t" . 'if ($delegate && !($' . $key . ' instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField)) {' . "\n";
                $code .= "\t\t" . '$' . $key . ' = new \\Pimcore\\Model\\DataObject\\Data\\EncryptedField($delegate, $' . $key . ');' . "\n";
                $code .= "\t" . '}' . "\n";
            }
        }

        if ($this->supportsDirtyDetection()) {
            $code .= "\t" . '$currentData = $this->get' . ucfirst($this->getName()) . '();' . "\n";
            $code .= "\t" . '$isEqual = $fd->isEqual($currentData, $' . $key . ');' . "\n";
            $code .= "\t" . 'if (!$isEqual) {' . "\n";
            $code .= "\t\t" . '$this->markFieldDirty("' . $key . '", true);' . "\n";
            $code .= "\t" . '}' . "\n";
        }

        if (method_exists($this, 'preSetData')) {
            $code .= "\t" . '$this->' . $key . ' = ' . '$fd->preSetData($this, $' . $key . ');' . "\n";
        } else {
            $code .= "\t" . '$this->' . $key . ' = ' . '$' . $key . ";\n";
        }

        $code .= "\t" . 'return $this;' . "\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getGetterCodeLocalizedfields(DataObject\ClassDefinition|DataObject\Objectbrick\Definition|DataObject\Fieldcollection\Definition $class): string
    {
        $key = $this->getName();
        $code = '/**' . "\n";
        $code .= '* Get ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @return ' . $this->getPhpdocReturnType() . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function get' . ucfirst($key) . ' (?string $language = null): ' . ($this->nullable ? '?' : '') . 'int {' . "\n";

        $code .= "\t" . '$data = $this->getLocalizedfields()->getLocalizedValue("' . $key . '", $language);' . "\n";

        if (!$class instanceof DataObject\Fieldcollection\Definition && !$class instanceof DataObject\Objectbrick\Definition) {
            $code .= $this->getPreGetValueHookCode($key);
        }

        $code .= "\t" . 'if ($data instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField) {' . "\n";
        $code .= "\t\t" . 'return $data->getPlain();' . "\n";
        $code .= "\t" . '}' . "\n";

        // we don't need to consider preGetData, because this is already managed directly by the localized fields within getLocalizedValue()

        $code .= "\treturn " . '$data' . ";\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getSetterCodeLocalizedfields(DataObject\ClassDefinition|DataObject\Objectbrick\Definition|DataObject\Fieldcollection\Definition $class): string
    {
        $key = $this->getName();

        if ($class instanceof DataObject\Objectbrick\Definition) {
            $classname = 'Objectbrick\\Data\\' . ucfirst($class->getKey());
            $containerGetter = 'getDefinition';
        } elseif ($class instanceof DataObject\Fieldcollection\Definition) {
            $classname = 'FieldCollection\\Data\\' . ucfirst($class->getKey());
            $containerGetter = 'getDefinition';
        } else {
            $classname = $class->getName();
            $containerGetter = 'getClass';
        }

        $code = '/**' . "\n";
        $code .= '* Set ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(['/**', '*/', '//'], '', $this->getTitle()) . "\n";
        $code .= '* @param ' . $this->getPhpdocReturnType() . ' $' . $key . "\n";
        $code .= '* @return \\Pimcore\\Model\\DataObject\\' . ucfirst($classname) . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function set' . ucfirst($key) . ' (' . ($this->nullable ? '?' : '') . 'int ' . '$' . $key . ', $language = null) {' . "\n";
        if ($this->supportsDirtyDetection()) {
            $code .= "\t" . '$fd = $this->' . $containerGetter . '()->getFieldDefinition("localizedfields")->getFieldDefinition("' . $key . '");' . "\n";
        }

        if ($this instanceof DataObject\ClassDefinition\Data\EncryptedField) {
            if ($this->getDelegate()) {
                $code .= "\t" . '$encryptedFd = $this->getClass()->getFieldDefinition("' . $key . '");' . "\n";
                $code .= "\t" . '$delegate = $encryptedFd->getDelegate();' . "\n";
                $code .= "\t" . 'if ($delegate && !($' . $key . ' instanceof \\Pimcore\\Model\\DataObject\\Data\\EncryptedField)) {' . "\n";
                $code .= "\t\t" . '$' . $key . ' = new \\Pimcore\\Model\\DataObject\\Data\\EncryptedField($delegate, $' . $key . ');' . "\n";
                $code .= "\t" . '}' . "\n";
            }
        }

        if ($this->supportsDirtyDetection()) {
            $code .= "\t" . '$currentData = $this->get' . ucfirst($this->getName()) . '($language);' . "\n";
            $code .= "\t" . '$isEqual = $fd->isEqual($currentData, $' . $key . ');' . "\n";
        } else {
            $code .= "\t" . '$isEqual = false;' . "\n";
        }

        $code .= "\t" . '$this->getLocalizedfields()->setLocalizedValue("' . $key . '", $' . $key . ', $language, !$isEqual)' . ";\n";

        $code .= "\t" . 'return $this;' . "\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getDataFromResource(mixed $data, Concrete $object = null, array $params = []): mixed
    {
        if (is_numeric($data)) {
            return $this->toNumeric($data);
        }

        if (null === $data) {
            return $this->nullable ? null : 0;
        }

        return $data;
    }

    public function getDataForQueryResource(mixed $data, Concrete $object = null, array $params = []): mixed
    {
        return $this->getDataForResource($data, $object, $params);
    }

    public function getDataForEditmode(mixed $data, Concrete $object = null, array $params = []): mixed
    {
        if (null === $data) {
            return $this->nullable ? null : 0;
        }

        return round($data / $this->getDecimalFactor(), $this->getDecimalPrecision());
    }

    public function getDataFromEditmode(mixed $data, Concrete $object = null, array $params = []): mixed
    {
        if (is_numeric($data)) {
            return (int) round((round((float) $data, $this->getDecimalPrecision()) * $this->getDecimalFactor()), 0);
        }

        if (null === $data && !$this->nullable) {
            $data = 0;
        }

        return $data;
    }

    public function getVersionPreview(mixed $data, Concrete $object = null, array $params = []): string
    {
        return (string) $data;
    }

    public function checkValidity(mixed $data, bool $omitMandatoryCheck = false, array $params = []): void
    {
        if (!$omitMandatoryCheck && $this->getMandatory() && $this->isEmpty($data)) {
            throw new ValidationException('Empty mandatory field [ ' . $this->getName() . ' ]');
        }

        if (!$this->isEmpty($data) && !is_numeric($data)) {
            throw new ValidationException('invalid numeric data [' . $data . ']');
        }

        if (!$this->isEmpty($data) && !$omitMandatoryCheck) {
            $data = $this->toNumeric($data);

            if ($data >= \PHP_INT_MAX) {
                throw new ValidationException('Value exceeds PHP_INT_MAX please use an input data type instead of numeric!');
            }

            if (null !== $this->getMinValue() && $this->getMinValue() > $data) {
                throw new ValidationException('Value in field [ ' . $this->getName() . ' ] is not at least ' . $this->getMinValue());
            }

            if (null !== $this->getMaxValue() && $this->getMaxValue() > 0 && $data > $this->getMaxValue()) {
                throw new ValidationException('Value in field [ ' . $this->getName() . ' ] is bigger than ' . $this->getMaxValue());
            }
        }
    }

    public function getForCsvExport(DataObject\Fieldcollection\Data\AbstractData|DataObject\Objectbrick\Data\AbstractData|DataObject\Localizedfield|Concrete $object, array $params = []): string
    {
        $data = $this->getDataFromObjectParam($object, $params);

        return (string) $data;
    }

    public function isDiffChangeAllowed(Concrete $object, array $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode(mixed $data, Concrete $object = null, array $params = []): ?array
    {
        return [];
    }

    public function isEmpty(mixed $data): bool
    {
        return null === $data || $data === '';
    }

    /**
     * @return int
     */
    protected function getDecimalFactor()
    {
        return \Pimcore::getContainer()->getParameter('coreshop.currency.decimal_factor');
    }

    /**
     * @return int
     */
    protected function getDecimalPrecision()
    {
        return \Pimcore::getContainer()->getParameter('coreshop.currency.decimal_precision');
    }

    /**
     * @param mixed $value
     */
    protected function toNumeric($value): float|int
    {
        if (!str_contains((string) $value, '.')) {
            return (int) $value;
        }

        return (float) $value;
    }
}

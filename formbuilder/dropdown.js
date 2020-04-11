/*eslint-disable react/prop-types*/

import React, { useMemo, useCallback } from "react";
import { get } from "lodash";

import { Dropdown } from "semantic-ui-react";
import { useFormikContext, useField } from "formik";
import PropTypes from "prop-types";

export function DropdownComponent({
  search,
  validate,
  addItem,
  dependencies,
  placeholder,
  closeOnChange = true,
  name,
  options,
  multiple,
  allowNew
}) {
  const [field, meta] = useField({
    name,
    type: "select",
    multiple,
    validate,
    dependencies
  });
  const formik = useFormikContext();

  const _options = options || formik.status?.options?.[name] || [];

  const onChange = useCallback(
    (e, { value }) => formik.setFieldValue(name, value),
    []
  );
  const renderLabel = useCallback(
    ({ text, color }) => ({ content: text, color }),
    []
  );
  const onAddItem = useCallback(
    async (e, { value }) => {
      const newvalue = (await addItem(value, formik))[0];
      if (newvalue)
        formik.setFieldValue(
          name,
          multiple
            ? get(formik, ["values", name]).concat([newvalue])
            : newvalue.value
        );
    },
    [formik]
  );
  return useMemo(
    () => (
      <Dropdown
        placeholder={placeholder}
        fluid
        search={search || false}
        selection
        options={_options}
        allowAdditions={allowNew || false}
        multiple={multiple}
        name={name}
        error={!!meta.error && meta.touched}
        onChange={onChange}
        renderLabel={renderLabel}
        onAddItem={onAddItem}
        value={field.value}
        closeOnChange={closeOnChange}
      />
    ),
    [
      placeholder,
      search,
      _options,
      allowNew,
      multiple,
      name,
      meta.error,
      meta.touched,
      onChange,
      renderLabel,
      onAddItem,
      field.value
    ]
  );
}
DropdownComponent.propTypes = {
  search: PropTypes.bool,
  optionsfrom: PropTypes.func,
  label: PropTypes.string,
  errors: PropTypes.any,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  requiredif: PropTypes.func,
  enabledif: PropTypes.func,
  displayif: PropTypes.func,
  options: PropTypes.array,
  multiple: PropTypes.bool,
  allowNew: PropTypes.bool
};

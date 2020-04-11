/*eslint-disable react/prop-types*/
import React from "react";
import { DateInput } from "semantic-ui-calendar-react";
import { useField } from "formik";
export function DatePickerComponent({ name, validate, placeholder }) {
  //eslint-disable-next-line no-unused-vars
  const [field, _, helpers] = useField({ name, validate });

  return (
    <DateInput
      name={name}
      placeholder={placeholder}
      value={field.value}
      iconPosition="left"
      onChange={(e, { value }) => {
        helpers.setValue(value);
      }}
    />
  );
}

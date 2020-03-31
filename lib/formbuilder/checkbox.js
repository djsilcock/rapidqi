/*eslint-disable react/prop-types*/
import React, { useMemo } from "react";
import { chunk } from "lodash";
import { Grid } from "semantic-ui-react";
import { FastField, useFormikContext } from "formik";
import PropTypes from "prop-types";
import { Form } from "semantic-ui-react";

export function BaseCheckboxComponent({
  Component,
  validate,
  onClickFactory,
  numCols,
  options,
  name
}) {
  options = options || useFormikContext().status.options?.[name];
  const WrappedCheckbox = ({ value: boxValue, label }) => {
    const renderfunc = ({
      field: { checked },
      meta: { value: fieldValue },
      form: { setFieldValue }
    }) => {
      const onClick = onClickFactory({
        name,
        fieldValue,
        boxValue,
        setFieldValue
      });
      return (
        <Component
          name={name}
          value={boxValue}
          checked={checked}
          onClick={onClick}
          label={label}
        />
      );
    };
    return (
      <FastField name={name} validate={validate} value={boxValue}>
        {renderfunc}
      </FastField>
    );
  };
  return useMemo(() => {
    var buttons = options.map(([val, btnlabel]) => (
      <WrappedCheckbox key={val} value={val} label={btnlabel} />
    ));
    const colLength = Math.ceil(buttons.length / numCols);
    const cols = chunk(buttons, colLength).map((column, idx) => (
      <Grid.Column key={idx}>{column}</Grid.Column>
    ));
    return (
      <Grid stackable columns={numCols}>
        {cols}
      </Grid>
    );
  }, [options]);
}
BaseCheckboxComponent.propTypes = {
  Component: PropTypes.any,
  numCols: PropTypes.number,
  options: PropTypes.array,
  optionsfrom: PropTypes.func
};

export function RadioComponent(props) {
  return (
    <BaseCheckboxComponent
      Component={Form.Radio}
      type="radio"
      numCols={1}
      ischecked={(f, b) => f == b}
      onClickFactory={({ name, boxValue, setFieldValue }) => () => {
        setFieldValue(name, boxValue);
      }}
      {...props}
    />
  );
}
export function CheckboxComponent(props) {
  return (
    <BaseCheckboxComponent
      Component={Form.Checkbox}
      type="checkbox"
      numCols={2}
      ischecked={(f, b) => f.includes?.(b)}
      onClickFactory={({ name, boxValue, fieldValue, setFieldValue }) => (
        evt,
        data
      ) => {
        if (data.checked) {
          setFieldValue(name, [boxValue, ...fieldValue]);
        } else {
          setFieldValue(
            name,
            fieldValue.filter(v => v != boxValue)
          );
        }
      }}
      {...props}
    />
  );
}

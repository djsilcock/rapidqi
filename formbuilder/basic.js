/*eslint-disable react/prop-types*/
import React from "react";
import { Form } from "semantic-ui-react";
import { FastField } from "formik";
export function InputComponent({ name, validate }) {
  return <FastField as={Form.Input} name={name} validate={validate} />;
}
export function TextAreaComponent({ name, validate }) {
  return <FastField as={Form.TextArea} {...{ name, validate }} />;
}
export function HiddenComponent({ name }) {
  return <FastField name={name} as="input" type="hidden" />;
}
HiddenComponent.isInvisible = true;

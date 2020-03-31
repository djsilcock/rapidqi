/*eslint-disable react/prop-types*/

import React, { useMemo } from "react";
import { Form, Message, Table } from "semantic-ui-react";
import { useFormikContext, ErrorMessage, setIn } from "formik";
import PropTypes from "prop-types";
import { RadioComponent, CheckboxComponent } from "./checkbox";
import { DatePickerComponent } from "./datepicker";
import { InputComponent, TextAreaComponent, HiddenComponent } from "./basic";
import { ArrayPopupComponent } from "./arraypopup";
import { DropdownComponent } from "./dropdown";
import { InnerFormContainer } from "./innerform";
import { ModalComponent } from "./modal";
import { merge } from "lodash";
const FormRow = React.memo(function({
  name,
  component: Component,
  displayif,
  label,
  helptext,
  required,
  error,
  touched,
  ...props
}) {
  const context = useFormikContext();

  displayif = displayif || (() => true);
  if (Component.isInvisible) return <Component name={name} {...props} />;
  if (!displayif(context)) return null;
  return (
    <Table.Row>
      <Table.Cell width={8}>
        <Form.Field required={required} error={!!error && touched}>
          <label>{label}</label>
        </Form.Field>
        {helptext ? <Message info>{`${helptext}`}</Message> : null}
        <ErrorMessage name={name}>
          {msg => (
            <Message error visible>
              {`${JSON.stringify(msg)}`}
            </Message>
          )}
        </ErrorMessage>
      </Table.Cell>
      <Table.Cell width={8}>
        <Component name={name} {...props} />
      </Table.Cell>
    </Table.Row>
  );
});
FormRow.displayName = "FormRow";
FormRow.propTypes = {
  valid: PropTypes.bool,
  errors: PropTypes.any,
  display: PropTypes.bool,
  label: PropTypes.string,
  helptext: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.any
};

/* function createYupSchema(formdef){
	const validfuncs={}
	formdef.forEach((fielddef) =>{
		const fieldname="_." + toPath(fielddef.name).join('.')
		const root=fieldname.substring(0,fieldname.lastIndexOf('.'))
		const leaf=fieldname.substring(fieldname.lastIndexOf('.')+1)
		validfuncs[fieldname] =fielddef.validation || Yup.mixed()
		validfuncs[root]=validfuncs[root] || Yup.object().shape({})
		})
	Object.keys(validfuncs).sort().reverse().forEach(
		(fieldname)=>{
			if (fieldname=='_') return
			const root=fieldname.substring(0,fieldname.lastIndexOf('.'))
			const leaf=fieldname.substring(fieldname.lastIndexOf('.')+1)
			validfuncs[root]=validfuncs[root].shape({[leaf]:validfuncs[fieldname]})
			}
	)
	return validfuncs._
}; */

function makeComponentList(formdef) {
  var formvalidate = undefined;
  const components = [];
  const effects = [];
  const listeners = {};
  const defaultValues = {};
  formdef.forEach(fielddef => {
    if (fielddef.name == "_") {
      formvalidate = fielddef.validation;
      return;
    }
    var Component = {
      text: InputComponent,
      textarea: TextAreaComponent,
      email: InputComponent,
      datepicker: DatePickerComponent,
      typeahead: DropdownComponent,
      radio: RadioComponent,
      checkbox: CheckboxComponent,
      hidden: HiddenComponent,
      arraypopup: ArrayPopupComponent,
      modal: ModalComponent
    }[fielddef.type];
    //eslint-disable-next-line no-undef
    if (fielddef.formdef) {
      fielddef.compiledformdef = makeComponentList(fielddef.formdef);
    }
    if (fielddef.effect) effects.push(fielddef.effect);
    if (fielddef.listener) {
      listeners[fielddef.listener.event] =
        listeners[fielddef.listener.event] || [];
      listeners[fielddef.listener.event].push(fielddef.listener.callback);
      if (Component?.listeners) merge(listeners, Component.listeners);
      return;
    }
    fielddef.validate = v =>
      fielddef.validation?.__isYupSchema__
        ? fielddef.validation.validate(v).then(
            () => undefined,
            e => e.message
          )
        : fielddef.validation?.(v);
    if (Component)
      components.push(
        <FormRow key={fielddef.name} component={Component} {...fielddef} />
      );
    setIn(defaultValues, fielddef.name, fielddef.defaultvalue);
  });
  return { components, defaultValues, formvalidate, effects, listeners };
}

function FormContainer({ formdef, ...props }) {
  const compiledForm = useMemo(() => makeComponentList(formdef), [formdef]);
  return <InnerFormContainer formdef={compiledForm} {...props} />;
}

//FormContainer.propTypes = {
//  formdef: PropTypes.array,
//  onSubmit: PropTypes.func,
//  action: PropTypes.string,
//  children: PropTypes.any
//};
export default FormContainer;

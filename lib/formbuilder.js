/*eslint-disable react/prop-types*/

import React, { useRef, useMemo, useCallback} from 'react';
import {get,chunk} from 'lodash'
import SemanticDatepicker from 'react-semantic-ui-datepickers';

import { Form, Message, Table, Grid, Dropdown, Modal, Button } from 'semantic-ui-react'
import invariant from 'invariant'
import { Formik, FastField, useFormikContext, FieldArray, useField, ErrorMessage, setIn } from 'formik'
import PropTypes from 'prop-types'

function RadioComponent(props) {
	return (<BaseCheckboxComponent
		Component={Form.Radio}
		type='radio'
		numCols={1}
		ischecked={(f, b) => f == b}
		onClickFactory={({name,boxValue, setFieldValue }) => (
			() => {
				setFieldValue(name,boxValue)
			}
		)}
		{...props}
	/>)
}

function CheckboxComponent(props) {
	return (<BaseCheckboxComponent
		Component={Form.Checkbox}
		type='checkbox'
		numCols={2}
		ischecked={(f, b) => f.includes?.(b)}
		onClickFactory={({ name,boxValue, fieldValue, setFieldValue }) => (
			(evt, data) => {
				if (data.checked) {
					setFieldValue(name,[boxValue, ...fieldValue])
				} else {
					setFieldValue(name,fieldValue.filter((v) => v != boxValue))
				}
			}
		)}
		{...props}
	/>)
}

function BaseCheckboxComponent({ Component, validate, onClickFactory, numCols, options, optionsfrom, name}) {
	options = useMemo(() => optionsfrom ? optionsfrom() : options, [options, optionsfrom])
	const WrappedCheckbox = ({ value: boxValue, label }) => {
		const renderfunc=({field:{checked},meta:{value:fieldValue},form:{setFieldValue}})=>{
			const onClick=onClickFactory({name,fieldValue,boxValue,setFieldValue})
			return <Component 
				name={name} 
				value={boxValue} 
				checked={checked} 
				onClick={onClick} 
				label={label} />
			}
	return <FastField name={name} validate={validate} value={boxValue}>{renderfunc}</FastField>
		
	}
	const cols = useMemo(() => {
		var buttons = options.map(([val, btnlabel]) => <WrappedCheckbox key={val} value={val} label={btnlabel} />)
		const colLength = Math.ceil(buttons.length / numCols)
		return chunk(buttons,colLength).map((column,idx)=>(
			<Grid.Column key={idx}>
					{column}
				</Grid.Column>
		))
		}, [])

	return useMemo(()=>
		<Grid stackable columns={numCols}>
			{cols}
		</Grid>
	,[cols])
}
BaseCheckboxComponent.propTypes = {
	Component: PropTypes.any,
	numCols: PropTypes.number,
	options: PropTypes.array,
	optionsfrom: PropTypes.func,
}

function DropdownComponent({ 
		search, 
		validate, 
		optionsfrom, 
		addItem, 
		dependencies,
		placeholder,
		closeOnChange=true, 
		name, 
		options, 
		multiple, 
		allowNew }) {

	const [field, meta] = useField({ name, type: 'select', multiple, validate,dependencies })
	const formik=useFormikContext()

	const _options = options || optionsfrom(formik)	
	const onChange = useCallback((e, { value }) => formik.setFieldValue(name, value), [])
	const renderLabel = useCallback(({ text, color }) => ({ content: text, color }), [])
	const onAddItem = useCallback(async (e, { value }) => {
		const newvalue = await addItem(value, Object.assign({}, formik, { queueModal: queueModal.bind(this, formik) }))
		if (newvalue) formik.setFieldValue(name, multiple ? get(formik, ['values', name]).concat([newvalue.value]) : newvalue.value)
	}, [])
	return useMemo(()=> <Dropdown
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
		/>,[placeholder,search,_options,allowNew,multiple,name,meta.error,meta.touched,onChange,renderLabel,onAddItem,field.value])

}

function queueModal(formik, { name, vars, onSubmit }) {
	const modalQueue = formik.status.modalQueue
	const modalPromise = new Promise(
		(res, rej) => {
			const newOnSubmit = (val) => {
				formik.setStatus(Object.assign({}, formik.status, { modalQueue: formik.status.modalQueue.slice(1) }))
				val ? res(val) : rej(val)
			}
			formik.setStatus(Object.assign({}, formik.status, { modalQueue: modalQueue.concat([{ name, vars, onSubmit: newOnSubmit }]) }))
		}
	)
	return onSubmit ? modalPromise.then(onSubmit) : modalPromise
}

function ModalComponent({ name, formdef }) {
	const formik = useFormikContext()

	const currentModal = formik.status.modalQueue[0]
	if (currentModal?.name !== name) return null
	const { vars, onSubmit } = currentModal
	const closeModal = async (value) => {
		if (value !== undefined) await Promise.resolve(onSubmit?.(value))
	}
	return (<Modal open={true}>
		<FormContainer
			formname={'modal' + name}
			onSubmit={(v) => { closeModal(v) }}
			onCancel={() => { closeModal() }}
			initialValues={vars}
			formdef={formdef}
			enableReinitialize
		>
			{({ submitForm, resetForm }) => (
				<>
					<Button icon='check' onClick={submitForm}>Save</Button>
					<Button icon="cancel" onClick={resetForm}>Cancel</Button>

				</>
			)}
		</FormContainer>
	</Modal>)
}

function ArrayPopupComponent({validate, name, summary, modalForm }) {
	const [field] = useField({ name, type: 'select', validate })
	const formik = useFormikContext()
	// end hooks
	return (
		<FieldArray name={name}>
			{(arrayhelpers) => (
				field.value.map(
					(subfield, index) => (summary(
						{
							value: subfield,
							remove: () => arrayhelpers.remove(index),
							popup: async () => {
								const values = await queueModal(formik, { name: modalForm, vars: subfield })
								arrayhelpers.replace(index, values)
							}
						})
					)))}
		</FieldArray>
	)
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
}

function DatePickerComponent({ name,validate}) {
	const [field, _, helpers] = useField({ name, validate })
	//end hooks

	return (
		<SemanticDatepicker
			iconPosition="left"
			name={name}
			onChange={(e, { value }) => { helpers.setValue(value) }}
			value={field.value}
			format="DD/MM/YYYY"
		/>
	)
}

function InputComponent({ name,validate }) {
	return (
		<FastField as={Form.Input} name={name} validate={validate} />
	)
}

function TextAreaComponent({ name,validate }) {
	return <FastField as={Form.TextArea} {...{name,validate}} />

}

const FormRow=React.memo(function ({ name, component:Component, displayif, label, helptext, required, error, touched,...props }) {
	const context=useFormikContext()

	displayif = displayif || (() => true)	
	if (!displayif(context)) return null
	return (
		<Table.Row >
			<Table.Cell width={8}><Form.Field required={required} error={!!error && touched}>
				<label>{label}</label></Form.Field>
				{helptext ? (<Message info>{helptext}</Message>) : null}
				<ErrorMessage name={name}>{(msg) => (<Message error visible>{msg}</Message>)}</ErrorMessage>
			</Table.Cell>
			<Table.Cell width={8}>
				<Component name={name} {...props}/>
			</Table.Cell>
		</Table.Row>
	)
})
FormRow.displayName="FormRow"
FormRow.propTypes = {
	valid: PropTypes.bool,
	errors: PropTypes.any,
	display: PropTypes.bool,
	label: PropTypes.string,
	helptext: PropTypes.string,
	required: PropTypes.bool,
	children: PropTypes.any
}


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
	var formvalidate = undefined
	const components = formdef.map((fielddef) => {
		if (fielddef.name == "_") {
			formvalidate = fielddef.validation
			return <></>
		}
		var Component = {
			text: InputComponent,
			textarea: TextAreaComponent,
			email: InputComponent,
			datepicker: DatePickerComponent,
			typeahead: DropdownComponent,
			radio: RadioComponent,
			checkbox: CheckboxComponent,
			hidden: () => (null),
			arraypopup: ArrayPopupComponent,
			modal: ModalComponent
		}[fielddef.type]
		if (process.env.NODE_ENV !== 'production') invariant(Component, 'Unrecognised field type:' + fielddef.type)
		const validate = (v) => fielddef.validation?.__isYupSchema__ ? fielddef.validation.validate(v).then(() => undefined, (e) => e.message) : fielddef.validation?.(v)
		return <FormRow key={fielddef.name} component={Component} {...fielddef} />
	}
	)
	const defaultValues = formdef.reduce((obj, fielddef) => (fielddef.name == "_" ? obj : setIn(obj, fielddef.name, fielddef.defaultvalue)), {})
	return [components, defaultValues, formvalidate]
}


function FormContainer({ formdef, initialValues, initialStatus, onSubmit, action}) {
	const formdefref = useRef(null)

	const getFormDef = () => {
		if (formdefref.current === null) formdefref.current = makeComponentList(formdef)
		return formdefref.current
	}
	const [components, defaultValues, formvalidate] = getFormDef()
	return (
		<div>

			<Formik
				initialStatus={Object.assign(initialStatus || {}, { modalOpen: undefined, modalQueue: [] })}
				initialValues={initialValues || defaultValues}
				validationSchema={formvalidate?.__isYupSchema__ ? formvalidate : undefined}
				validate={formvalidate?.__isYupSchema__ ? undefined : formvalidate}
				onSubmit={onSubmit}>
				{(formikprops) => {
					return <Form action={action} >
							<Table selectable><Table.Body>
								{components}
							</Table.Body></Table>
							<Button icon='check' content="Save" type="button" onClick={formikprops.submitForm}/>
							<Button icon="cancel" content="Cancel" type="button" onClick={formikprops.resetForm}/>
						</Form>
				
				}}
			</Formik>
		</div>)
}
FormContainer.propTypes = {
	formdef: PropTypes.array,
	onSubmit: PropTypes.func,
	action: PropTypes.string,
	children: PropTypes.any
}
export default FormContainer	

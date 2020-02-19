/* eslint-disable no-console */
import React, { useEffect, useMemo,useRef, useCallback } from 'react';
import {useCurrentUser} from '../lib/signin'
import {Icon,Button,Label} from 'semantic-ui-react'

import FormContainer from '../lib/formbuilder'
import allUsersQuery from '../queries/allusers.gql'
import addProjectQuery from '../queries/addproject.gql'

import Router,{useRouter} from 'next/router'

import taglist from '../lib/taglist'

console.log('loading addproject')
import * as Yup from 'yup'
import { useQuery,useMutation,useApolloClient } from '../lib/apollo';

const getStaffNames=({status})=>status.staffnames ?? []

var addedPersonCount=0
function addPerson(persongroup){
	return async (item,{values,setFieldValue,queueModal})=>{
		const newitem=await queueModal({name:'people_popup',vars:{text:item,value:'NEW-'+(addedPersonCount++),grade:""}})
		setFieldValue('people.added',values.people.added.concat([newitem]))
		setFieldValue('people.'+persongroup,values.people[persongroup].concat([newitem.value]))
	}
}


const NO_DATA=Symbol()

const addUserForm=[
	{	name:'text',
		type:'text',
		label:'Full name',
		placeholder:'Name',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{	
		name:'value',
		type:'hidden',
		defaultvalue:""
	},{
		name:'category',
		type:'radio',
		label:'Job role',
		options:Object.entries(
			{MS:'Medical student',
			 AA:'Anaesthesia Associate',
			 NS:'Nurse',
			 FY:'FY1/FY2',
			 CT:'CT1-2',
			 ACCS:'ACCS',
			 Inter:'ST3-4',
			 Higher:'ST5-7',
			 SAS:'Staff grade',
			 Con:'Consultant',
			 Oth:'Other'}),
		validation:Yup.string().required(),
		defaultvalue:""
	}
	]
const addProjectForm = [
	{
		name:'_',
		validation:Yup.object().shape({dates:Yup.object().shape({finish:Yup.date().min(Yup.ref('start'),'Finish date must be later than start date')})})
	},
	{	name:'title',
		type:'text',
		label:"Project Title",
		placeholder:"Project Title",
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		name:'people_popup',
		type:'modal',
		formdef:addUserForm,
	},{
		name:'people.proposers',
		type:'typeahead',
		multiple:true,
		label:'Name of proposer(s)',
		optionsfrom:getStaffNames,
		dependencies:['_status'],
		addItem:addPerson('proposers'),
		required:true,
		validation:Yup.array().required().min(1),
		defaultvalue:[]
	},{
		name:'people.new',
		type:'arraypopup',
		modalForm:'people_popup',
		label:'Register these people as users:',
		summary:({popup,remove,value})=><div> <Button size='mini' icon='pencil' onClick={popup}/><Button size='mini' icon='user delete' onClick={remove}/>
			{{MS:<Label color='gray'>{value.text} (Med st)</Label>,
			 AA:<Label color='purple'>{value.text} (AA)</Label>,
			 NS:<Label color='blue'>{value.text} (Nurse)</Label>,
			 FY:<Label color='blue'>{value.text} (FY1/2)</Label>,
			 CT:<Label color='green'>{value.text}(CT1/2)</Label>,
			 ACCS:<Label color='green'>{value.text}(ACCS)</Label>,
			 Inter:<Label color='orange'>{value.text}(ST3/4)</Label>,
			 Higher:<Label color='red'>{value.text}(ST5/7)</Label>,
			 SAS:<Label color='gray'>{value.text}(SAS)</Label>,
			 Con:<Label color='black'>{value.text}(Cons)</Label>,
			 Oth:<Label color='gray'>{value.text}(Other)</Label>}[value.category]} </div>,
		defaultvalue:[],
		displayif:(values)=>(values.people.added.length>0)
	},{
		name:'description',
		type:'textarea',
		label:"What are you trying to improve?",
		placeholder:"Enter description of project here",
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
		
	},{
		name:'dates.proposed',
		type:'datepicker',
		label:"When was this project proposed?",
		required:true,
		validation:Yup.date().required(),
		defaultvalue:""
	},{
		name:'methodology',	
		type:'textarea',
		label:"How do you plan to conduct your project?",
		placeholder:"Brief description of methodology eg notes review,survey etc",
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		name:'category',
		type:'checkbox',
		options:(Object.entries(taglist)),
		label:'Areas covered',
		required:true,
		validation:Yup.array().required(),
		defaultvalue:[]
	},{
		name:'othertags',
		type:'text',
		displayif:((values)=>(values?.category?.includes?.('other'))),
		label:"Other areas covered",
		placeholder:"Other areas covered",
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		name:'people.leaders',
		type:'typeahead',
		multiple:true,
		label:'Who will lead this project?',
		optionsfrom: getStaffNames,
		addItem:addPerson('leaders'),
		search:true,
		allowNew:true,
		helptext:"Leave blank if you want somebody to volunteer to lead",
		defaultvalue:[]
	},{
		name:"email",
		type:"email",
		label:"Contact email address for team:",
		placeholder:"Contact address",
		validation:Yup.string().email('Please enter a valid email address'),
		defaultvalue:""
	},{
		name:'people.involved',
		type:'typeahead',
		label:'Other people involved',
		multiple:true,
		search:true,
		allowNew:true,
		optionsfrom:getStaffNames,
		addItem: addPerson('involved'),
		defaultvalue:[]
	},{
		type:'radio',	
		options:[["Yes",'Yes'],["No",'No']],
		name:'advertise',
		label:'Would you like us to advertise your project to get more people involved?',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'radio',
		options:[["Yes",'Yes'],["No",'No']],
		name:'mm_or_ci',
		label:'Is this project a result of a Morbidity and Mortality or Critical Incident event?',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'radio',
		options:Object.entries({	
				'Yes':'Yes - it has been approved',
				'No':'No - Caldicott approval is not required',
				'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
				'pending':'Caldicott approval is pending'		
				}),
		name:'caldicott',
		label:'Does this project have Caldicott approval?',
		helptext:'Caldicott approval is required if patient identifiable information is being collected',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'radio',
		options:Object.entries({
			'Yes':'Yes - it has been approved',
			'No':'No - R+D approval is not required',
			'DontKnow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
			'Pending':'R+D approval is pending'
			}),
		name:'research',
		label:'Does this project have R+D approval?',
		helptext:(<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>),
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'datepicker',
		name:'dates.start',
		label:"When do you propose to start?",
		required:true,
		validation:Yup.date().required(),
		defaultvalue:""
	},{
		type:'datepicker',
		name:'dates.finish',
		label:"When do you plan to finish or report on this project?",
		required:true,
		validation:Yup.date().required(),
		defaultvalue:""
	},{
		name:'canDisplay',
		type:'radio',
		options:Object.entries({'Yes':'Yes',
			'No':'No',
			'NotYet':'Not at this time - maybe later'
				}),
		label:'Are you happy for this project to be displayed on the QI whiteboard and on this website?',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	}
]


function ProjectInfoForm(){
	//const user=useCurrentUser()
	//const isAdmin=useAdminUser()	
	var initialvalues=undefined
	const router=useRouter()
	const apolloclient=useApolloClient()
	const formdef=addProjectForm
	const formref=useRef()
	const {data:usersquery}=useQuery(allUsersQuery)
	const staffnames=useMemo(()=>(
		usersquery?.allUsers?.map((s)=>({key:s.id,value:s.id,text:s.realName,description:s.category}))
				.concat(formref.current?.values.people.added ?? []) ?? []
	),[usersquery])
	useEffect(()=>{
		if (!formref.current) return
		const status=formref.current.status
		const newstatus={
			...status,
			staffnames,
			}
		formref.current.setStatus(newstatus)
		
	},[staffnames])
	const initialStatus={staffnames}
	var isCompleted=useRef(false)
	const handleSubmit=async (values)=>{
		await apolloclient.mutate({mutation:addProjectQuery,variables:{project:values}})
		router.push('/')
	}
	const handleClose=()=>{
		isCompleted.current=true
	}
	useEffect(()=>{
		if (isCompleted.current) router.push('/')
	})
	
	
	return (<div>
          <h2>
            Project information
          </h2>
          <div>
			
		
        <FormContainer
			formname='addproject'
			onSubmit={handleSubmit}
			onCancel={handleClose}
			initialValues={initialvalues}
			initialStatus={initialStatus}
			formdef={formdef}
			innerRef={formref}
			>
		{({submitForm,resetForm,values,errors,status,setStatus})=>{
			

			return <>
			<Button icon='check' content="Save" type="button" onClick={submitForm}/>
			<Button icon="cancel" content="Cancel" type="button" onClick={resetForm}/>
			</>
		}}
			</FormContainer>
			
		
    
	
            
          </div>
		<hr/>
          
            
			
          
        </div>

	)
}

export default ProjectInfoForm
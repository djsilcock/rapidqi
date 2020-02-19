import React,{useCallback} from 'react';
import Head from 'next/head'
import taglist from '../lib/taglist'
import Link from 'next/link'
import Router from 'next/router'
import immutable from 'immutable'
import { Grid, Segment, Table, Label, Modal, Header, Button, Menu, Icon } from 'semantic-ui-react'

import {useQuery} from '../lib/apollo'
import { PROJECT_LIST,CURRENT_USER } from '../queries';


function generateLabels(doc,isAdmin) {
	const labels=[]
	doc.category.forEach((categoryTag) => {
		labels.push({key:categoryTag, text:taglist[categoryTag]})
	})
	if (doc.candisplay !== 'Yes') labels.push({key:'isinvisible', text:'Private'})
	if (doc.advertise === 'true') labels.push({key:'advertise', text:'Looking for participants'})
	if (doc.caldicott === 'pending') labels.push({key:"caldicott", text:'Caldicott pending',color:'orange'})
	if (doc.research === 'pending') labels.push({key:"research",text:"R+D pending", color:'orange'})
	if (doc.leadername.length === 0) labels.push({key:'needslead', text:"Needs lead", color:'red'})
	if (isAdmin && doc.caldicott === 'Dontknow') labels.push({key:'caldicott', text:"Might need Caldicott", color:'red'})
	if (isAdmin && doc.research === 'Dontknow') labels.push({key:'research', text:"Might need R+D", color:'red'})
	if (doc.commit !== true) labels.push({key:"needsmoderated", text:"Awaiting moderation", color:'red'})
	const rowcolor=
		labels.some((lab)=>(lab.color=="red"))?"red":
		labels.some((lab)=>(lab.color=="orange"))?"orange":
		labels.some((lab)=>(lab.color=="yellow"))?"yellow":
		labels.some((lab)=>(lab.color=="blue"))?"blue":undefined
	return [labels,rowcolor]
}

function DatabaseRow({doc, ...props}) {
	const [modalOpen,setModalOpen]=React.useState(false)
	if (doc===null) return (
		<Table.Row key={doc.id}>
		<Table.Cell>
			<Header>Loading...</Header>
			<span><Label>Please wait...</Label> </span>
		</Table.Cell>
	</Table.Row>
	)
	const {
		proposername,
		title,
		description,
		leadername,
		peopleinvolved,
		category,
		candisplay,
		advertise,
		caldicott,
		research } = doc
	
	const handleHide = () => { setModalOpen(false) }
	const {data:currentuser} = useQuery(CURRENT_USER)
	const isAdmin = currentuser.isAdmin
	function makehref(user) {
		return <Link key={user.uid} href={"/message/" + user.uid}>{user.realname}{user.role === 'lead' ? '(lead)' : ''}</Link>
	}
	var myname = currentuser ? currentuser.displayName : null
	var iAmLeader = leadername.find((i)=>(i.id==currentuser.id)) || isAdmin
	var iAmInvolved = iAmLeader || peopleinvolved.find((i)=>(i.id==currentuser.id))
	const status = { info: 1, warning: 2, danger: 3 }
	var [labels, rowstatus] = generateLabels(doc,isAdmin)
	const projectComplete=false
	const buttons = []
	if (!iAmInvolved && !projectComplete) buttons.push({ pathname: '/enquire', icon: 'question-circle', text: 'Enquire about this' })
	if (iAmLeader && !projectComplete) {
		buttons.push({ pathname: '/edit', icon: 'pencil', text: 'Edit proposal' })
		buttons.push({ pathname: '/addoutcome', icon: 'pencil', text: 'Add outcome information' })
	} else {
		buttons.push({ pathname: '/view', icon: 'info', text: 'View proposal' })
		if (doc.outcome) buttons.push({ pathname: '/viewoutcome', icon: 'info', text: 'View outcome information' })
	}


	return (<Table.Row color={rowstatus}
		key={doc.id}
		onClick={(e) => { setModalOpen(true); e.stopPropagation() }}>
		<Table.Cell>
			<Header>{title}</Header>
			{labels.map((r) => (<span key={r.key}><Label color={r.style}>{r.value}</Label> </span>))}
			<Modal open={modalOpen} onClose={handleHide}>
				<Modal.Header>{title}</Modal.Header>
				<Modal.Content>
					{description}
					<hr />
					<b>Proposed by: </b>{proposername}<br />
					{(leadername.length === 0) ? (
						<><b>Project lead: </b>(No leader yet)</>
					) : (leadername.length ===1) ? (
						<><b>Project lead: </b>{leadername[0]['realName']}<br /></>
					) : (
						<><b>Project leads: </b>{leadername.map((i)=>(i.fullName)).join(',')}<br /></>
					)
					}
					{peopleinvolved && peopleinvolved.length > 0 ? <span><b>Others involved: </b>{peopleinvolved.map((i)=>(i.fullName)).join(',')}</span> : null}
					<hr />
					<Modal.Actions>

						{buttons.map((b, i) => (
							<Link key={i} href={{ pathname: b.pathname, query: { doc: doc.id } }}>
								<Button>
									<Icon name={b.icon} />
									{b.text}
								</Button>
							</Link>
						))}

						<Button onClick={(e) => { setModalOpen(false); e.stopPropagation() }}><Icon name="close" />Close</Button>
					</Modal.Actions>
				</Modal.Content>
			</Modal>
		</Table.Cell>
	</Table.Row>)
}




function DatabaseTable(props) {
	
	
	const [statusfilter, setstatusfilter] = React.useState('all')
	const {loading:docsloading,data:projects}=useQuery(PROJECT_LIST,{variables:{filter:[statusfilter]}})
	const {loading:userloading,data:currentuser}=useQuery(CURRENT_USER)
	const isAdmin = !!currentuser?.isAdmin


	if (userloading) return "Waiting for user"
	if (docsloading) return "Waiting for database"
	
	var listitems = projects.projectList.filter(
		(doc) => {
			switch (statusfilter) {
				case "all":
					return true;
				case "needslead":
					return (doc.leader.length === 0)
				case "recruiting":
					return (doc.leader.length === 0 || doc.advertise === 'true')
				default:
					return (statusfilter === doc.status)
			}
		}).map(
			(doc) => {
				return (<DatabaseRow doc={doc} visible={props.match && props.match.params === doc.id} key={doc.id} />)
			});
		const table=(listitems.length===0)?<p>Sorry, nothing to show here</p>:<Table celled selectable id="accordion-example"><Table.Body>{listitems}</Table.Body></Table>
	return (<div className="App">
		<Head>
			<title>People Make QI</title>
		</Head>

		<Menu tabular>
			<Menu.Item active={statusfilter === "all"} onClick={() => setstatusfilter('all')}>All</Menu.Item>
			<Menu.Item active={statusfilter === "needsLead"} onClick={() => setstatusfilter('needsLead')}>Needs lead</Menu.Item>
			<Menu.Item active={statusfilter === "isRecruiting"} onClick={() => setstatusfilter('isRecruiting')}>Looking for collaborators</Menu.Item>
			<Menu.Item active={statusfilter === "recentlyUpdated"} onClick={() => setstatusfilter('recentlyUpdated')}>Recently Updated</Menu.Item>
			<Menu.Item active={statusfilter === "isCompleted"} onClick={() => setstatusfilter('isCompleted')}>Completed</Menu.Item>
		</Menu>

		{table}
	</div>)
}

export default DatabaseTable

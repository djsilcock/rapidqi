import React from 'react';
import {useCurrentUser,signout} from '../lib/signin'
import Link from 'next/link'
import {Menu,Icon} from 'semantic-ui-react'

function TopNav (props){
	const [user,isAdmin]=useCurrentUser()
	const loginbutton=(!user || user.isAnonymous)?(
		<Link href="/signin" passHref>
		<Menu.Item>Login 
				<Icon name='sign-in'/> 
			
		</Menu.Item>
		</Link>
							
		):(
		<Menu.Item onClick={()=>{signout()}}> 	
				<span>
					<Icon name='sign-out'/>
				Logout {user.realName} {isAdmin?'(admin)':''}
				</span>
			
		</Menu.Item>
		)
	return 	(<Menu stackable inverted>
					
            <Link href="/" passHref><Menu.Item header>QEUH QI Portal</Menu.Item></Link>
						<Link href="/addproject"><Menu.Item> <Icon name='thumbs up'/>Propose Project </Menu.Item></Link>
						
					  
						<Link href="/projects" passHref><Menu.Item><Icon name='list'/>Projects</Menu.Item></Link>
				{loginbutton}
				</Menu>)
					
	}
			
    

export default TopNav

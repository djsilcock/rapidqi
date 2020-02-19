
import {useQuery} from '../apollo'
import { CURRENT_USER } from '../../queries';
//export {signout,SignInScreen,signin} from './firebase'

export function signout(){}
export function SignInScreen(props){return null}
export function signin(){}

export function useCurrentUser(){
  const userdata=useQuery(CURRENT_USER)
  return [userdata?.data?.getLoggedInUser || null, userdata?.data?.getLoggedInUser?.isAdmin ?? false]
}

export function useLoginRequired(){
  return [false,()=>{}]
}

export function SigninAssistant(props) {
  return props.children
}


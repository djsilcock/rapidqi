var firebase
var config
///#if isServer
import firebase_admin from "firebase-admin"
firebase=firebase_admin

import config from '~/configs/firebaseServer'


///#else

import firebase_app from 'firebase/app';
firebase=firebase_app
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage'
import config from '~/configs/firebaseClient'
// Initialize Firebase
;

///#endif
const firebaseapp=!firebase.apps.length ? firebase.initializeApp(config) : firebase.app()
  
export {firebaseapp,firebase}


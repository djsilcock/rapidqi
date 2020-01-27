var firebase
var config
///#if isServer
import firebase_admin from "firebase-admin"
import getSecret from '../../vault'
firebase=firebase_admin

 config={
    credential: firebase.credential.cert(getSecret('firebase')) ,
    databaseURL: "https://qiexchange-223621.firebaseio.com"
  };

///#else

import firebase_app from 'firebase/app';
firebase=firebase_app
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage'

// Initialize Firebase
config = {
    apiKey: "AIzaSyCt3Ri-z60wBPpFf0w-ZWlP6gTv9szfwew",
    authDomain: "qiexchange-223621.firebaseapp.com",
    databaseURL: "https://qiexchange-223621.firebaseio.com",
    projectId: "qiexchange-223621",
    storageBucket: "qiexchange-223621.appspot.com",
    messagingSenderId: "53765016271"

};

///#endif
const firebaseapp=!firebase.apps.length ? firebase.initializeApp(config) : firebase.app()
  
export {firebaseapp,firebase}


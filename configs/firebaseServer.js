import firebase_admin from "firebase-admin"
import getSecret from '~/vault'


const config= {
    credential: firebase.credential.cert(getSecret('firebase')) ,
    databaseURL: "https://qiexchange-223621.firebaseio.com"
  }
  
export default config
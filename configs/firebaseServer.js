import firebase from "firebase-admin"

const config= {
    credential: firebase.credential.cert(process.env.FIREBASE) ,
    databaseURL: "https://qiexchange-223621.firebaseio.com"
  }
  
export default config
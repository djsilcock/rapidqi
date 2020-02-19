import firebase from "firebase-admin"
console.log('firebase:',process.env.FIREBASE)
const config= {
    credential: firebase.credential.cert(process.env.FIREBASE) ,
    databaseURL: "https://qiexchange-223621.firebaseio.com"
  }
  
export default config
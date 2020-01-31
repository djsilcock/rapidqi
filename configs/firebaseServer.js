import firebase_admin from "firebase-admin"

const config= {
    credential: process.env.FIREBASE ,
    databaseURL: "https://qiexchange-223621.firebaseio.com"
  }
  
export default config
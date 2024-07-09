import * as admin from 'firebase-admin';
import * as serviceAccount from './serviceAccount.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://simple-chat-fd1b8.firebaseio.com",
    storageBucket: "simple-chat-fd1b8.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

export { admin, db, bucket };

import { initializeApp } from 'firebase/app';
// import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB3qGv__4hbvTauMhMmVcHViolBsdRv5kM',
  authDomain: 'helpdeskcapty.firebaseapp.com',
  projectId: 'helpdeskcapty',
  storageBucket: 'helpdeskcapty.appspot.com',
  messagingSenderId: '892052120',
  appId: '1:892052120:web:9afd31e24ad84f26eea6ed',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
export const storage = getStorage(app);

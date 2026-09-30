
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "firsthireai-33481.firebaseapp.com",
  projectId: "firsthireai-33481",
  storageBucket: "firsthireai-33481.firebasestorage.app",
  messagingSenderId: "1065055007167",
  appId: "1:1065055007167:web:8fc5b7110da8e37450b10a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' });

export { auth , provider}
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCFDn97E18VfXTsQKav4kVlWBYVMBPPcHA",             
  authDomain: "library-management-syste-954b9.firebaseapp.com",
  projectId: "library-management-syste-954b9",
  storageBucket: "library-management-syste-954b9.firebasestorage.app",
  messagingSenderId: "970880147712",
  appId: "1:970880147712:web:9e36def83dda06b98193e5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
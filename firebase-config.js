import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    onSnapshot, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmQmDlSQz_ewf_szWCGCgSDEuEC13GbK4",
  authDomain: "controle-de-contas-8a0fc.firebaseapp.com",
  projectId: "controle-de-contas-8a0fc",
  storageBucket: "controle-de-contas-8a0fc.firebasestorage.app",
  messagingSenderId: "88972805126",
  appId: "1:88972805126:web:da71d9986fe39aba5d6f87",
  measurementId: "G-G7MEE6ZB3Q"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore (Banco de Dados)
const db = getFirestore(app);

// Exporta o que vamos usar no script.js
export { db, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy };
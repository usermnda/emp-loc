// 1) Colle ici la config de TON projet Firebase (voir README, étape 3).
// Ces valeurs ne sont pas secrètes : la sécurité vient des règles (firestore.rules / storage.rules).
export const firebaseConfig = {
  apiKey: "AIzaSyDtYxmdcMYeZ5er5zLGgB2N_yypA1N1wMw",
  authDomain: "emp-lov.firebaseapp.com",
  databaseURL: "https://emp-lov-default-rtdb.firebaseio.com",
  projectId: "emp-lov",
  storageBucket: "emp-lov.firebasestorage.app",
  messagingSenderId: "210831116108",
  appId: "1:210831116108:web:ea2fa85196a87fbb9531e9",
  measurementId: "G-L2H3G14FZG"
};
// true  = photos et PDF dans Firebase Storage (demande le plan Blaze avec carte bancaire, gratuit sous le quota)
// false = mode gratuit : photos réduites et stockées dans la base, manuels = liens
export const useStorage = false;

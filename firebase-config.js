// 1) Colle ici la config de TON projet Firebase (voir README, étape 3).
// Ces valeurs ne sont pas secrètes : la sécurité vient des règles (firestore.rules / storage.rules).
export const firebaseConfig = {
  apiKey: "COLLE_ICI",
  authDomain: "COLLE_ICI",
  projectId: "COLLE_ICI",
  storageBucket: "COLLE_ICI",
  messagingSenderId: "COLLE_ICI",
  appId: "COLLE_ICI"
};
// true  = photos et PDF dans Firebase Storage (demande le plan Blaze avec carte bancaire, gratuit sous le quota)
// false = mode gratuit : photos réduites et stockées dans la base, manuels = liens
export const useStorage = false;

# EMP location – site catalogue (HTML + Firebase)

Site 100 % statique (aucun serveur à gérer) : il se met sur GitHub Pages, et Firebase s'occupe des comptes,
des mots de passe, des rôles, des produits et des devis.

## Étape 1 – Créer le projet Firebase (gratuit)
1. Va sur https://console.firebase.google.com → **Ajouter un projet** → nom « emp-location » (Analytics : non).
2. Menu **Build → Authentication** → *Commencer* → onglet *Sign-in method* → active **E-mail/Mot de passe**.
3. Menu **Build → Firestore Database** → *Créer une base de données* → région **europe-west (Belgique/Paris)** → mode production.
4. Dans Firestore, onglet **Règles** : efface tout, colle le contenu du fichier `firestore.rules`, clique **Publier**.

## Étape 2 – Récupérer la config
Engrenage ⚙ en haut à gauche → *Paramètres du projet* → en bas « Vos applications » → icône **</>** (Web) →
donne un nom, **Enregistrer**. Tu vois un bloc `firebaseConfig = {...}` : copie les valeurs dans le fichier
`firebase-config.js`. (Ces valeurs ne sont pas secrètes, tu peux les pousser sur GitHub.)

## Étape 3 – Mettre sur GitHub + GitHub Pages
1. Sur github.com : **New repository** → nom `emp-location` → Create.
2. Clique **uploading an existing file**, glisse TOUS les fichiers de ce dossier → **Commit changes**.
3. Dépôt → **Settings → Pages** → Source : *Deploy from a branch* → branche `main`, dossier `/ (root)` → Save.
4. Après ~1 minute ton site est sur `https://TON-PSEUDO.github.io/emp-location/`.
5. **Important** : Firebase → Authentication → *Paramètres* → *Domaines autorisés* → **Ajouter** `TON-PSEUDO.github.io`.
   (Sans ça, la connexion est refusée.)

## Étape 4 – Devenir admin
1. Sur ton site, clique **Connexion → Créer un compte** avec ton e-mail.
2. Firebase → Firestore → collection **users** → ouvre ton document → change le champ `role` de `client` en **admin**.
3. Recharge le site : le lien **Administration** apparaît. Tu peux ajouter produits, photos, créer des comptes clients, etc.

## Photos et manuels (2 modes, réglage dans `firebase-config.js`)
- `useStorage = false` (par défaut, gratuit) : les photos sont réduites (900 px) et stockées dans la base ;
  les manuels sont des **liens** (ex. un PDF sur Google Drive en partage public). Limite : ~4 photos par appareil.
- `useStorage = true` : photos et PDF dans **Firebase Storage**. Depuis février 2026, Google exige le plan **Blaze**
  (carte bancaire, mais gratuit sous le quota ; mets une alerte de budget à 5 €). Active *Build → Storage*, onglet Règles :
  colle `storage.rules`, Publier.

## Tester en local
Ouvre le dossier dans VS Code + extension **Live Server** (un double-clic sur index.html ne marche pas, à cause des modules JS).

## Rôles et sécurité
- `client` : voit le catalogue, génère des devis, voit SES devis. `admin` : tout gérer.
- La sécurité est dans `firestore.rules` : même en bidouillant le site, un client ne peut pas se donner le rôle admin
  ni lire les devis des autres.
- « Désactiver » un client est préférable à « Suppr. » (la suppression retire son profil mais pas son compte de connexion,
  à supprimer dans Firebase → Authentication).
- Pour changer la mise en page : `style.css`. Pour la logique : `app.js`.

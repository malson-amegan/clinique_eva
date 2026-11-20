# Clinique EVA

Site web et espace d’administration de la Clinique EVA. L’application utilise
PostgreSQL pour stocker les rendez-vous et les contenus du site.

## Démarrage avec Neon

PostgreSQL n’a pas besoin d’être installé sur votre ordinateur : Neon héberge la
base de données en ligne.

1. Créez un projet PostgreSQL sur [Neon](https://neon.tech/).
2. Dans le tableau de bord Neon, récupérez les informations de connexion
   (host, database, user et password).
3. À la racine du projet, copiez `.env.example` vers `.env`, puis remplacez les
   valeurs d’exemple par celles fournies par Neon. Utilisez le même utilisateur
   et mot de passe pour les variables `SQL_*` et `SQL_ADMIN_*`. Remplacez aussi
   `SUPER_ADMIN_EMAILS` par l’adresse Google vérifiée du responsable de la
   clinique et `MEDICAL_REVIEWER_EMAILS` par les adresses des professionnels
   qui sont autorisés à valider les contenus médicaux.
4. Installez les dépendances et créez les tables à partir du schéma :

   ```sh
   bun install
   bun run db:push
   ```

   Le script indique explicitement le fichier de configuration Drizzle situé
   dans `src/db/drizzle.config.ts`.

5. Démarrez l’application :

   ```sh
   bun run dev
   ```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000). Les données
d’exemple sont ajoutées automatiquement au premier chargement si les tables
sont vides.

Ne partagez pas le fichier `.env` et ne le commitez pas : il contient le mot de
passe de la base de données.

## Connexion Google et espace patient

Dans Firebase Console, activez Google dans **Authentication → Sign-in method**
et vérifiez que le domaine utilisé pour le site figure dans les domaines
autorisés (**localhost** pour le développement local). Les erreurs
d’authentification affichent maintenant des indications correspondant au code
retourné par Firebase.

Un compte Google devient super-administrateur uniquement si son adresse
vérifiée figure dans `SUPER_ADMIN_EMAILS`. Les nouveaux comptes ne reçoivent
jamais les droits administrateur par défaut.

# Projets Systèmes Industriels 2025

Ce site web présente une collection de projets de Sciences de l'Ingénieur pour l'année 2025.

## Mise à jour : Affichage des PDFs style Scribd

Le site utilise maintenant un affichage des PDFs inspiré du site letudiant.fr, qui implémente une interface similaire à Scribd. Cela améliore l'expérience utilisateur en proposant :

- Un affichage encadré avec en-tête indiquant le titre du document
- Des boutons d'action bien visibles pour voir en plein écran ou télécharger
- Une meilleure prise en charge des appareils mobiles
- Un chargement progressif avec indicateur
- Une gestion des navigateurs sans support PDF

## Structure du Projet

- `welcome.html` - Page d'accueil du site
- `projet_XXX.html` - Pages des différents projets
- `pdfs/` - Dossier contenant tous les PDF des sujets et ressources
- `style.css` - Feuille de style du site
- `script.js` - Script JavaScript du site
- `scribdStyle.js` - Script pour l'affichage des PDFs style Scribd
- `fallbackPdf.js` - Gère les alternatives pour les navigateurs sans support PDF
- `service-worker.js` & `sw-register.js` - Pour la mise en cache des PDFs

## Déploiement sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com/) si ce n'est pas déjà fait
2. Connectez votre compte GitHub à Vercel
3. Importez ce dépôt dans Vercel
4. Aucune configuration supplémentaire n'est nécessaire, Vercel utilisera automatiquement le fichier `vercel.json`

## Résolution des problèmes

Si vous rencontrez une erreur 404 NOT_FOUND:
1. Vérifiez que tous les fichiers sont correctement déployés sur Vercel
2. Assurez-vous que les chemins des PDF sont corrects
3. Vérifiez que le fichier `vercel.json` est présent et correctement configuré

## Développement Local

Pour exécuter ce site localement:
```bash
npx http-server
```
Puis visitez http://localhost:8080 dans votre navigateur.

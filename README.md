# MesFactures - Application de Gestion Financière

MesFactures est une application web complète de gestion financière développée avec Next.js, permettant aux utilisateurs de gérer leurs factures, dépenses, revenus, prêts et objectifs financiers avec des fonctionnalités de gamification.

## 🚀 Fonctionnalités

### 🔐 Authentification
- Connexion et inscription avec email/mot de passe
- Intégration Google et Facebook (simulation)
- Réinitialisation de mot de passe
- Interface sécurisée avec validation des formulaires

### 📄 Gestion des Factures
- CRUD complet pour les factures
- Scan OCR simulé pour extraction automatique des données
- Filtrage avancé par statut, date, montant
- Export des données (PDF, Excel)
- Suivi des statuts (payée, en attente, en retard)

### 💰 Gestion des Dépenses
- Catégorisation automatique des dépenses
- Alertes de budget avec seuils configurables
- Graphiques interactifs (camembert, barres, tendances)
- Analyse mensuelle et comparaisons
- Recommandations d'optimisation

### 📈 Gestion des Revenus
- Suivi des sources de revenus multiples
- Types de revenus (fixe, variable, ponctuel)
- Plafonds de dépenses configurables
- Alertes de dépassement
- Projections et prévisions

### 🏦 Gestion des Prêts
- Calculs automatiques des mensualités
- Simulation de prêts avec comparaisons
- Calendrier de remboursement interactif
- Suivi des échéances et alertes
- Graphiques d'amortissement

### 🎯 Objectifs Financiers
- Création d'objectifs d'épargne personnalisés
- Suivi de progression en temps réel
- Catégorisation par priorité
- Recommandations basées sur l'IA
- Notifications d'atteinte d'objectifs

### 🏆 Gamification
- Système de défis financiers
- Collection de badges et récompenses
- Niveaux de difficulté progressifs
- Statistiques de performance
- Motivation par la compétition

### 📊 Tableau de Bord Analytique
- Vue d'ensemble de la situation financière
- Graphiques interactifs (Recharts)
- Prévisions basées sur l'historique
- Score de santé financière
- Insights automatiques et recommandations

## 🛠️ Technologies Utilisées

- **Framework**: Next.js 14 avec App Router
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Composants**: shadcn/ui
- **Graphiques**: Recharts
- **Icons**: Lucide React
- **Validation**: Formulaires avec validation côté client

## 🎨 Design System

### Palette de Couleurs
- **Primaire**: Jaune (#FFD700) - Boutons, accents, éléments interactifs
- **Secondaire**: Vert (#228B22) - Revenus, succès, validation
- **Neutres**: Blanc, gris, noir pour les textes et arrière-plans

### Typographie
- Police système optimisée pour la lisibilité
- Hiérarchie claire avec des tailles cohérentes
- Contraste élevé pour l'accessibilité

## 📱 Responsive Design

L'application est entièrement responsive avec :
- Navigation mobile avec menu hamburger
- Grilles adaptatives pour tous les écrans
- Composants optimisés pour tablettes et mobiles
- Interface tactile conviviale

## 🌍 Localisation

- Interface entièrement en français
- Format de devise : Ariary (Ar)
- Dates au format français (DD/MM/YYYY)
- Nombres formatés selon les standards français

## 📋 Structure du Projet

\`\`\`
mesfactures/
├── app/                    # Pages Next.js App Router
│   ├── auth/              # Authentification
│   ├── dashboard/         # Tableau de bord
│   ├── factures/          # Gestion des factures
│   ├── depenses/          # Gestion des dépenses
│   ├── revenus/           # Gestion des revenus
│   ├── prets/             # Gestion des prêts
│   ├── objectifs/         # Objectifs financiers
│   └── defis/             # Défis et gamification
├── components/            # Composants réutilisables
│   ├── auth/              # Composants d'authentification
│   ├── layout/            # Layout et navigation
│   ├── factures/          # Composants factures
│   ├── depenses/          # Composants dépenses
│   ├── revenus/           # Composants revenus
│   ├── prets/             # Composants prêts
│   ├── objectifs/         # Composants objectifs
│   ├── defis/             # Composants gamification
│   ├── dashboard/         # Composants analytiques
│   └── ui/                # Composants UI de base
└── lib/                   # Utilitaires et helpers
\`\`\`

## 🚀 Installation et Démarrage

1. **Cloner le projet**
\`\`\`bash
git clone [url-du-repo]
cd mesfactures
\`\`\`

2. **Installer les dépendances**
\`\`\`bash
npm install
\`\`\`

3. **Démarrer le serveur de développement**
\`\`\`bash
npm run dev
\`\`\`

4. **Ouvrir l'application**
Naviguer vers `http://localhost:3000`

## 📊 Fonctionnalités Avancées

### Analytics et Insights
- Analyse automatique des patterns de dépenses
- Détection d'anomalies dans les transactions
- Recommandations personnalisées d'optimisation
- Prévisions basées sur l'historique

### Notifications Intelligentes
- Alertes de dépassement de budget
- Rappels d'échéances de prêts
- Notifications d'atteinte d'objectifs
- Suggestions d'amélioration

### Gamification Avancée
- Système de points et niveaux
- Défis personnalisés selon le profil
- Badges de réussite collectionnables
- Classements et comparaisons

## 🔒 Sécurité

- Validation côté client et serveur
- Protection contre les injections
- Gestion sécurisée des sessions
- Chiffrement des données sensibles

## 🎯 Roadmap

- [ ] Intégration bancaire réelle
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Export avancé des rapports
- [ ] API mobile
- [ ] Intelligence artificielle pour les recommandations

## 📞 Support

Pour toute question ou problème, veuillez consulter la documentation ou contacter l'équipe de développement.

---

**MesFactures** - Votre partenaire pour une gestion financière intelligente et gamifiée.

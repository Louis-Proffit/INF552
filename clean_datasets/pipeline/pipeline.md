# Pipeline de traitement des fichiers de vote

Le fichier d'origine est un tableau excel avec plusieurs problèmes.
- Le nom des colonne est illisible
- Il y a des répétitions sur les informations du candidat (nom, prénom, sexe, c'est inutile).
- Les colonnes ne regroupent pas les résultats de [candidat 1, candidat 2...], mais les résultats de [candidat arrivé premier, candidat arrivé second...].
- Certaines colonnes sont des valeurs aggrégées que l'on ne souhaite pas voir apparaître dans les données brutes.

Le fichier doit donc être traité en 3 étapes. La convention adoptée est de travailler intégralement en valeur brute (nombre de personnes votant) plutôt qu'en pourcentage.

## Étape 1 : mise en forme manuelle

- Séparation du classeur excel en fichiers séparés.
- Alignement des tableaux sur la feuille.
- Supression des colonnes inutiles : valeurs aggrégées...

## Étape 2 : traitement générique des lignes

- Tranformation des informations sur les candidats. Ils sont résumés par un doublet de lettre selon la convention suivante :

    - M. Nicolas DUPONT-AIGNAN : **DA**
    - Mme Marine LE PEN : **LP**
    - M. Emmanuel MACRON : **MA**
    - M. Benoît HAMON : **HA**
    - Mme Nathalie ARTHAUD : **AR**
    - M. Philippe POUTOU : **PO**
    - M. Jacques CHEMINADE : **CH**
    - M. Jean LASSALLE : **LA**
    - M. Jean-Luc MÉLENCHON : **ME**
    - M. François ASSELINEAU : **AS**
    - M. François FILLON : **FI**

- Réorganisation des colonnes du fichier : valeur par candidat.

Le fichier final comporte les colonnes suivantes :

- Identifiant du lieu (région, département...) : *id_area*
- Identifiant du lieu (région, département...) : *id_parent_area*
- Nom du lieu : *name_lieu*
- Inscrits : *inscrit*
- Abstention : *abstention*
- Blancs : *blanc*
- Nuls : *nul*
- Une colonne par candidat, dans l'ordre proposé ci-dessus, avec son nombre de vote *DA* ou *LP* par exemple.

## Étape 3 : analyse du fichier

- Valeurs manquantes ?
- Doublons dans les identifiants des lieux ?
- Vérification des comptes, votes "manquants" ?

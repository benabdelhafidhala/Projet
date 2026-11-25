// ============================================================
// storage.js — Gestion de la sauvegarde des tâches
// Ce fichier s'occupe de lire et d'écrire les données dans
// le localStorage du navigateur. Le localStorage est un
// espace de stockage intégré au navigateur qui permet de
// garder des données même après avoir fermé ou rechargé la page.
// ============================================================

// Clé utilisée pour identifier nos données dans le localStorage.
// Toutes nos tâches seront sauvegardées sous ce nom précis.
const STORAGE_KEY = "simple_task_manager_tasks";

/**
 * loadTasks() — Charger les tâches sauvegardées
 *
 * Cette fonction est appelée au démarrage de l'application.
 * Elle lit les données stockées dans le localStorage sous la clé STORAGE_KEY.
 *
 * Le localStorage ne peut stocker que du texte (des chaînes de caractères),
 * donc les données sont enregistrées au format JSON (une sorte de texte
 * structuré). On utilise JSON.parse() pour convertir ce texte en tableau
 * JavaScript utilisable.
 *
 * Si aucune donnée n'existe (première visite), elle retourne un tableau vide [].
 * Si les données sont corrompues (cas rare), le bloc try/catch intercepte
 * l'erreur, l'affiche dans la console, et retourne [] pour éviter un crash.
 *
 * Retourne : un tableau (array) d'objets tâches, ou [] si vide ou erreur.
 */
function loadTasks() {
  try {
    // On tente de récupérer la chaîne JSON stockée dans le localStorage
    const rawData = localStorage.getItem(STORAGE_KEY);

    // Si aucune donnée n'est trouvée, on retourne un tableau vide
    if (!rawData) {
      return [];
    }

    // On convertit la chaîne JSON en tableau JavaScript avec JSON.parse()
    const parsed = JSON.parse(rawData);

    // On vérifie que c'est bien un tableau avant de le retourner,
    // pour éviter des erreurs si le format des données est inattendu
    return Array.isArray(parsed) ? parsed : [];

  } catch (error) {
    // En cas d'erreur (données corrompues, etc.), on affiche l'erreur
    // dans la console et on retourne un tableau vide
    console.error("[storage.js] Erreur lors du chargement des tâches :", error);
    return [];
  }
}

/**
 * saveTasks(tasks) — Sauvegarder les tâches dans le localStorage
 *
 * Cette fonction est appelée à chaque fois qu'une tâche est ajoutée,
 * modifiée, supprimée ou cochée comme terminée.
 *
 * Elle reçoit le tableau complet des tâches et le convertit en texte JSON
 * grâce à JSON.stringify(), car le localStorage ne peut stocker que du texte.
 * Ce texte est ensuite sauvegardé sous la clé STORAGE_KEY.
 *
 * Paramètres :
 *   - tasks (array) : le tableau complet des objets tâches à sauvegarder
 * Retourne : rien (void)
 */
function saveTasks(tasks) {
  try {
    // JSON.stringify() transforme le tableau JavaScript en chaîne de texte JSON.
    // Par exemple : [{ id: 1, title: "Faire les courses" }]
    // devient → '[{"id":1,"title":"Faire les courses"}]'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

  } catch (error) {
    // En cas d'erreur (ex: stockage plein ou désactivé), on l'affiche en console
    console.error("[storage.js] Erreur lors de la sauvegarde des tâches :", error);
  }
}

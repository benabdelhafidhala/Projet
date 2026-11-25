// ============================================================
// form.js — Gestion du formulaire HTML
// Ce fichier s'occupe de tout ce qui concerne le formulaire :
// lire les valeurs saisies, valider les données, afficher les
// erreurs, et basculer entre le mode "Ajout" et le mode "Modification".
// Il est chargé après storage.js et avant app.js.
// ============================================================

// ---- Références aux éléments HTML du formulaire ----
// On sélectionne chaque élément du formulaire une seule fois
// au chargement du fichier, pour pouvoir les réutiliser dans les fonctions.

const taskForm       = document.getElementById("task-form");     // Le formulaire entier <form>
const formTitle      = document.getElementById("form-title");    // Le titre "Ajouter" ou "Modifier"
const titleInput     = document.getElementById("task-title");    // Le champ texte pour le titre
const categorySelect = document.getElementById("task-category"); // Le menu déroulant Catégorie
const prioritySelect = document.getElementById("task-priority"); // Le menu déroulant Priorité
const formError      = document.getElementById("form-error");    // Le paragraphe d'erreur rouge
const submitBtn      = document.getElementById("submit-btn");    // Le bouton "Ajouter" / "Enregistrer"
const cancelBtn      = document.getElementById("cancel-btn");    // Le bouton "Annuler"

/**
 * getFormData() — Lire les valeurs actuelles du formulaire
 *
 * Cette fonction est appelée au moment de la soumission du formulaire,
 * juste avant la validation. Elle lit ce que l'utilisateur a saisi ou
 * sélectionné dans les trois champs du formulaire.
 *
 * On utilise .trim() sur le titre pour supprimer les espaces vides
 * au début et à la fin (ex: "  Faire les courses  " devient "Faire les courses").
 * Cela évite d'accepter un titre composé uniquement d'espaces.
 *
 * Retourne : un objet avec trois propriétés : { title, category, priority }
 */
function getFormData() {
  return {
    title: titleInput.value.trim(),    // Texte saisi dans le champ titre, sans espaces inutiles
    category: categorySelect.value,    // Option sélectionnée dans le menu Catégorie
    priority: prioritySelect.value,    // Option sélectionnée dans le menu Priorité
  };
}

/**
 * validateForm(data) — Vérifier que les données du formulaire sont valides
 *
 * Cette fonction est appelée après getFormData(), avant d'ajouter ou
 * de modifier une tâche. Elle vérifie que l'utilisateur a bien rempli
 * les champs obligatoires avec des données acceptables.
 *
 * On vérifie deux règles :
 *   1. Le titre ne doit pas être vide.
 *   2. Le titre doit avoir au moins 3 caractères (pour éviter "a" ou "ab").
 *
 * Si une règle est violée, on retourne un message d'erreur (string).
 * Si tout est correct, on retourne une chaîne vide "" (ce qui signifie "pas d'erreur").
 * Dans app.js, on vérifie si le retour est "" ou non pour décider quoi faire.
 *
 * Paramètres :
 *   - data (objet) : les données lues par getFormData()
 * Retourne : string — un message d'erreur ou "" si valide
 */
function validateForm(data) {
  // Règle 1 : le titre ne doit pas être vide
  if (!data.title) {
    return "Veuillez entrer un titre pour la tâche.";
  }

  // Règle 2 : le titre doit comporter au moins 3 caractères
  if (data.title.length < 3) {
    return "Le titre doit contenir au moins 3 caractères.";
  }

  // Aucune erreur détectée : on retourne une chaîne vide
  return "";
}

/**
 * showFormError(message) — Afficher ou effacer le message d'erreur
 *
 * Cette fonction met à jour le texte du paragraphe d'erreur rouge
 * situé sous les champs du formulaire.
 *
 * Si on lui passe un message d'erreur, il s'affiche en rouge.
 * Si on lui passe une chaîne vide "", l'erreur disparaît.
 *
 * L'attribut aria-live="polite" sur l'élément HTML permet aux lecteurs
 * d'écran d'annoncer automatiquement le message aux personnes malvoyantes.
 *
 * Paramètres :
 *   - message (string) : le texte à afficher, ou "" pour effacer
 * Retourne : rien (void)
 */
function showFormError(message) {
  formError.textContent = message;
}

/**
 * setFormEditMode(task) — Passer le formulaire en mode "Modification"
 *
 * Cette fonction est appelée dans app.js lorsque l'utilisateur clique
 * sur le bouton "Modifier" d'une tâche. Elle remplit le formulaire avec
 * les informations actuelles de la tâche sélectionnée, et change le texte
 * des boutons et du titre pour indiquer qu'on est en mode modification.
 *
 * Après cet appel, si l'utilisateur soumet le formulaire, app.js saura
 * qu'il faut modifier la tâche existante (et non en créer une nouvelle),
 * grâce à la variable editingTaskId qui a été définie juste avant cet appel.
 *
 * Paramètres :
 *   - task (objet) : la tâche à modifier, contenant { id, title, category, priority }
 * Retourne : rien (void)
 */
function setFormEditMode(task) {
  // On change le titre de la section et le texte du bouton pour indiquer
  // à l'utilisateur qu'il est en train de modifier une tâche existante
  formTitle.textContent = "Modifier la tâche";
  submitBtn.textContent = "Enregistrer";

  // On rend le bouton "Annuler" visible en retirant la classe CSS "hidden"
  cancelBtn.classList.remove("hidden");

  // On remplit les champs du formulaire avec les valeurs actuelles de la tâche
  titleInput.value       = task.title;
  categorySelect.value   = task.category;
  prioritySelect.value   = task.priority;

  // On efface tout ancien message d'erreur qui pourrait encore être affiché
  showFormError("");

  // On place le curseur directement dans le champ titre pour faciliter la saisie
  titleInput.focus();
}

/**
 * resetForm() — Remettre le formulaire en mode "Ajout" et vider les champs
 *
 * Cette fonction est appelée après l'ajout d'une tâche, après une modification
 * réussie, ou lorsque l'utilisateur clique sur "Annuler".
 *
 * taskForm.reset() est une méthode native du navigateur qui vide tous les
 * champs de texte et remet les menus déroulants à leur valeur par défaut,
 * telle que définie dans le HTML (par exemple, "Moyenne" pour la priorité).
 *
 * Retourne : rien (void)
 */
function resetForm() {
  // Vider tous les champs et remettre les menus à leur valeur par défaut
  taskForm.reset();

  // Remettre le titre de la section et le bouton en mode "Ajout"
  formTitle.textContent = "Ajouter une nouvelle tâche";
  submitBtn.textContent = "Ajouter";

  // Cacher à nouveau le bouton "Annuler" en rajoutant la classe CSS "hidden"
  cancelBtn.classList.add("hidden");

  // Effacer tout message d'erreur éventuel
  showFormError("");
}

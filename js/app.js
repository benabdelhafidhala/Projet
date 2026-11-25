// ============================================================
// app.js — Logique principale de l'application (CRUD + affichage)
// C'est le fichier central qui fait fonctionner l'application.
// Il utilise les fonctions de storage.js (pour sauvegarder) et
// de form.js (pour gérer le formulaire), et s'occupe de :
//   - Ajouter, modifier, supprimer et cocher les tâches (CRUD)
//   - Construire le HTML des tâches dynamiquement (DOM)
//   - Filtrer et afficher la liste sur la page
//   - Écouter les actions de l'utilisateur (événements)
// ============================================================

// ---- Références aux éléments HTML de la liste ----
const taskListElement    = document.getElementById("task-list");      // La liste <ul> où s'affichent les tâches
const taskCountElement   = document.getElementById("task-count");     // Le compteur de tâches ex: (3)
const emptyMessageElement = document.getElementById("empty-message"); // Le message "Aucune tâche pour le moment"
const filterSelect       = document.getElementById("filter-status");  // Le menu déroulant de filtre

// ---- État de l'application ----
// Ces deux variables sont le "cœur" de l'état de l'application.
// Elles sont déclarées ici et utilisées par toutes les fonctions.

// On charge immédiatement les tâches sauvegardées depuis le localStorage
// grâce à loadTasks() définie dans storage.js
let tasks = loadTasks();

// Cette variable indique si on est en mode "Ajout" ou "Modification".
// null = on est en train d'ajouter une nouvelle tâche
// un nombre (ex: 1234567890) = on est en train de modifier la tâche avec cet id
let editingTaskId = null;


// ============================================================
// FONCTIONS CRUD — Créer, Lire, Modifier, Supprimer
// ============================================================

/**
 * addTask(data) — Ajouter une nouvelle tâche
 *
 * Cette fonction crée un nouvel objet tâche à partir des données du formulaire
 * et l'ajoute au tableau `tasks`. Elle est appelée dans l'écouteur du formulaire
 * uniquement quand editingTaskId vaut null (mode ajout).
 *
 * Chaque tâche est un objet avec 5 propriétés :
 *   - id       : identifiant unique généré avec Date.now() (timestamp en millisecondes)
 *   - title    : le titre saisi par l'utilisateur
 *   - category : la catégorie choisie (Études, Travail, Personnel)
 *   - priority : la priorité choisie (Basse, Moyenne, Haute)
 *   - completed: booléen, false par défaut (la tâche n'est pas encore terminée)
 *
 * Paramètres :
 *   - data (objet) : { title, category, priority } lu depuis le formulaire
 * Retourne : rien (void)
 */
function addTask(data) {
  // On construit le nouvel objet tâche
  const newTask = {
    id: Date.now(),           // Date.now() retourne le nombre de millisecondes depuis 1970 → toujours unique
    title: data.title,
    category: data.category,
    priority: data.priority,
    completed: false,         // Par défaut, une nouvelle tâche n'est pas terminée
  };

  // On ajoute la nouvelle tâche à la fin du tableau avec push()
  tasks.push(newTask);

  // On sauvegarde immédiatement le tableau mis à jour dans le localStorage
  saveTasks(tasks);

  // On affiche un message dans la console pour faciliter le débogage
  console.log("[app.js] Tâche ajoutée :", newTask);
}

/**
 * updateTask(id, data) — Modifier une tâche existante
 *
 * Cette fonction est appelée lors de la soumission du formulaire quand
 * editingTaskId n'est pas null, c'est-à-dire quand on est en mode modification.
 *
 * Elle cherche la tâche dans le tableau `tasks` grâce à son identifiant unique (id),
 * puis met à jour ses propriétés avec les nouvelles valeurs du formulaire.
 * La propriété `completed` n'est PAS modifiée ici, pour conserver l'état de la case à cocher.
 *
 * Paramètres :
 *   - id   (number) : l'identifiant de la tâche à modifier
 *   - data (objet)  : { title, category, priority } — les nouvelles valeurs
 * Retourne : rien (void)
 */
function updateTask(id, data) {
  // find() parcourt le tableau et retourne le premier élément dont item.id === id.
  // Si aucun élément ne correspond, il retourne undefined.
  const task = tasks.find((item) => item.id === id);

  // Si la tâche n'est pas trouvée (cas anormal), on affiche un avertissement et on arrête
  if (!task) {
    console.warn("[app.js] Tâche introuvable pour la modification, id :", id);
    return;
  }

  // On met à jour uniquement les propriétés modifiables depuis le formulaire
  task.title    = data.title;
  task.category = data.category;
  task.priority = data.priority;
  // Note : task.completed reste inchangé (on ne touche pas à l'état coché/non coché)

  // On sauvegarde le tableau mis à jour dans le localStorage
  saveTasks(tasks);

  console.log("[app.js] Tâche modifiée :", task);
}

/**
 * deleteTask(id) — Supprimer une tâche de la liste
 *
 * Cette fonction est appelée quand l'utilisateur clique sur "Supprimer".
 * Elle demande d'abord une confirmation via une boîte de dialogue native du navigateur.
 * Si l'utilisateur confirme, la tâche est retirée du tableau et la liste est mise à jour.
 *
 * On utilise filter() pour recréer un nouveau tableau qui contient TOUTES les tâches
 * SAUF celle dont l'id correspond. C'est plus propre que de supprimer directement
 * un élément dans le tableau avec splice().
 *
 * Paramètres :
 *   - id (number) : l'identifiant de la tâche à supprimer
 * Retourne : rien (void)
 */
function deleteTask(id) {
  // confirm() affiche une boîte de dialogue avec OK et Annuler.
  // Si l'utilisateur clique sur "Annuler", confirm() retourne false
  // et on arrête la fonction avec return pour ne rien supprimer.
  const confirmed = confirm("Voulez-vous vraiment supprimer cette tâche ?");
  if (!confirmed) {
    return;
  }

  // filter() crée un NOUVEAU tableau avec seulement les tâches dont l'id est différent.
  // La tâche ciblée est donc exclue du nouveau tableau.
  tasks = tasks.filter((item) => item.id !== id);

  // On sauvegarde le tableau mis à jour
  saveTasks(tasks);

  // Cas particulier : si l'utilisateur supprime la tâche qu'il était en train de modifier,
  // on réinitialise editingTaskId et on remet le formulaire en mode "Ajout"
  if (editingTaskId === id) {
    editingTaskId = null;
    resetForm();
  }

  console.log("[app.js] Tâche supprimée, id :", id);

  // On rafraîchit l'affichage pour que la tâche disparaisse de la liste
  renderTasks();
}

/**
 * toggleTask(id) — Cocher ou décocher une tâche (terminée / en cours)
 *
 * Cette fonction est appelée quand l'utilisateur coche ou décoche la case
 * à cocher d'une tâche. Elle inverse la valeur de la propriété `completed`
 * de la tâche correspondante.
 *
 * L'opérateur ! (NOT logique) inverse un booléen :
 *   - Si completed était false (en cours), il devient true (terminée)
 *   - Si completed était true (terminée), il devient false (en cours)
 *
 * Paramètres :
 *   - id (number) : l'identifiant de la tâche à cocher/décocher
 * Retourne : rien (void)
 */
function toggleTask(id) {
  // On cherche la tâche dans le tableau
  const task = tasks.find((item) => item.id === id);

  // Si la tâche n'est pas trouvée, on arrête
  if (!task) {
    return;
  }

  // On inverse la valeur booléenne de completed
  task.completed = !task.completed;

  // On sauvegarde et on rafraîchit l'affichage
  saveTasks(tasks);
  renderTasks();
}

/**
 * startEditTask(id) — Démarrer la modification d'une tâche
 *
 * Cette fonction est appelée quand l'utilisateur clique sur "Modifier".
 * Elle mémorise l'id de la tâche en cours de modification dans editingTaskId,
 * puis appelle setFormEditMode() (définie dans form.js) pour remplir
 * le formulaire avec les données actuelles de la tâche.
 *
 * À partir de ce moment, si l'utilisateur soumet le formulaire,
 * l'écouteur de soumission saura qu'il faut appeler updateTask()
 * et non addTask(), grâce à editingTaskId !== null.
 *
 * Paramètres :
 *   - id (number) : l'identifiant de la tâche à modifier
 * Retourne : rien (void)
 */
function startEditTask(id) {
  // On cherche la tâche dans le tableau
  const task = tasks.find((item) => item.id === id);

  // Si la tâche n'est pas trouvée, on arrête
  if (!task) {
    return;
  }

  // On mémorise l'id de la tâche en cours de modification
  editingTaskId = id;

  // On appelle setFormEditMode() de form.js pour remplir le formulaire
  // et passer visuellement en mode "Modification"
  setFormEditMode(task);
}


// ============================================================
// FONCTIONS D'AFFICHAGE — Construire et afficher le DOM
// ============================================================

/**
 * createTaskElement(task) — Construire l'élément HTML d'une tâche
 *
 * Cette fonction crée dynamiquement en JavaScript tout le code HTML
 * d'une tâche (un élément <li>) avec ses informations, sa case à cocher,
 * ses badges de catégorie/priorité, et ses boutons Modifier et Supprimer.
 *
 * On utilise document.createElement() pour créer chaque balise HTML,
 * .className pour ajouter les classes CSS, .textContent pour le texte
 * (plus sûr que innerHTML car il n'interprète pas le HTML),
 * et addEventListener() pour écouter les clics sur les boutons.
 *
 * Paramètres :
 *   - task (objet) : une tâche avec { id, title, category, priority, completed }
 * Retourne : un élément <li> complet, prêt à être inséré dans la page
 */
function createTaskElement(task) {
  // On crée l'élément <li> principal qui représente une tâche
  const li = document.createElement("li");
  // Si la tâche est terminée, on ajoute la classe "completed" qui applique
  // un style barré au titre (défini dans style.css)
  li.className = task.completed ? "task-item completed" : "task-item";

  // ---- Partie gauche : case à cocher + titre + badges ----
  const leftDiv = document.createElement("div");
  leftDiv.className = "task-left";

  // Création de la case à cocher
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed; // La case est cochée si la tâche est terminée
  // Quand l'utilisateur coche ou décoche, on appelle toggleTask() avec l'id de la tâche
  checkbox.addEventListener("change", () => toggleTask(task.id));

  // Conteneur pour le titre et les badges
  const infoDiv = document.createElement("div");
  infoDiv.className = "task-info";

  // Le titre de la tâche affiché en gras
  const titleSpan = document.createElement("span");
  titleSpan.className = "task-title";
  titleSpan.textContent = task.title; // .textContent est sûr : il n'interprète pas le HTML

  // Conteneur pour les badges (catégorie + priorité)
  const metaDiv = document.createElement("div");
  metaDiv.className = "task-meta";

  // Badge de catégorie (ex: "Études")
  const categoryBadge = document.createElement("span");
  categoryBadge.className = "badge";
  categoryBadge.textContent = task.category;

  // Badge de priorité avec une couleur différente selon la valeur.
  // On utilise .toLowerCase() pour transformer "Haute" → "haute",
  // ce qui correspond aux classes CSS : badge-haute, badge-moyenne, badge-basse
  const priorityBadge = document.createElement("span");
  priorityBadge.className = `badge badge-${task.priority.toLowerCase()}`;
  priorityBadge.textContent = task.priority;

  // On assemble la partie gauche dans l'ordre
  metaDiv.appendChild(categoryBadge);
  metaDiv.appendChild(priorityBadge);
  infoDiv.appendChild(titleSpan);
  infoDiv.appendChild(metaDiv);
  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(infoDiv);

  // ---- Partie droite : boutons Modifier et Supprimer ----
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "task-actions";

  // Bouton "Modifier" : au clic, appelle startEditTask() avec l'id de la tâche
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn-edit";
  editBtn.textContent = "Modifier";
  editBtn.addEventListener("click", () => startEditTask(task.id));

  // Bouton "Supprimer" : au clic, appelle deleteTask() avec l'id de la tâche
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-delete";
  deleteBtn.textContent = "Supprimer";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);

  // On assemble le <li> complet avec la partie gauche et la partie droite
  li.appendChild(leftDiv);
  li.appendChild(actionsDiv);

  // On retourne l'élément <li> complet pour qu'il soit ajouté à la liste dans renderTasks()
  return li;
}

/**
 * renderTasks() — Afficher la liste des tâches sur la page
 *
 * C'est la fonction d'affichage principale. Elle est appelée à chaque fois
 * que quelque chose change : ajout, modification, suppression, cochage ou
 * changement de filtre.
 *
 * Elle lit le filtre sélectionné, filtre le tableau `tasks` en conséquence,
 * vide la liste HTML, puis reconstruit chaque élément <li> grâce à
 * createTaskElement() et l'ajoute dans le <ul>.
 *
 * Retourne : rien (void)
 */
function renderTasks() {
  // On lit la valeur du menu déroulant de filtre : "all", "pending" ou "completed"
  const filterValue = filterSelect.value;

  // On filtre le tableau selon la valeur sélectionnée :
  // - "pending"   → uniquement les tâches non terminées (completed === false)
  // - "completed" → uniquement les tâches terminées (completed === true)
  // - "all"       → toutes les tâches (aucun filtre appliqué)
  const filteredTasks = tasks.filter((task) => {
    if (filterValue === "pending")   return !task.completed;
    if (filterValue === "completed") return task.completed;
    return true; // "all" : on retourne toujours true pour garder toutes les tâches
  });

  // On vide complètement le contenu actuel de la liste <ul>
  // pour éviter d'afficher les tâches en double à chaque rafraîchissement
  taskListElement.innerHTML = "";

  // On met à jour le compteur affiché entre parenthèses dans le titre de la liste
  taskCountElement.textContent = filteredTasks.length;

  // Si aucune tâche ne correspond au filtre, on affiche le message "Aucune tâche"
  if (filteredTasks.length === 0) {
    emptyMessageElement.classList.remove("hidden");
  } else {
    // Sinon, on cache le message vide et on construit les <li> un par un
    emptyMessageElement.classList.add("hidden");

    // forEach() parcourt chaque tâche du tableau filtré.
    // Pour chaque tâche, on crée un <li> avec createTaskElement()
    // et on l'ajoute à la liste avec appendChild().
    filteredTasks.forEach((task) => {
      taskListElement.appendChild(createTaskElement(task));
    });
  }
}


// ============================================================
// ÉCOUTEURS D'ÉVÉNEMENTS — Réagir aux actions de l'utilisateur
// Ces blocs de code "écoutent" les interactions et appellent
// les bonnes fonctions en réponse.
// ============================================================

/**
 * Soumission du formulaire (clic sur "Ajouter" ou "Enregistrer")
 *
 * Cet écouteur est déclenché quand l'utilisateur soumet le formulaire.
 * event.preventDefault() est INDISPENSABLE : il empêche le comportement
 * par défaut du navigateur qui rechargerait la page à chaque soumission.
 *
 * La logique est la suivante :
 *   1. On lit les données du formulaire avec getFormData()
 *   2. On les valide avec validateForm()
 *   3. Si erreur → on l'affiche et on arrête
 *   4. Si OK     → on appelle updateTask() ou addTask() selon editingTaskId
 *   5. On remet le formulaire en mode "Ajout" et on rafraîchit la liste
 */
taskForm.addEventListener("submit", (event) => {
  // On empêche le rechargement de la page (comportement par défaut d'un formulaire HTML)
  event.preventDefault();

  // On lit les valeurs actuelles du formulaire (depuis form.js)
  const data = getFormData();

  // On valide les données (depuis form.js). Si errorMessage n'est pas vide, il y a une erreur.
  const errorMessage = validateForm(data);

  if (errorMessage) {
    // On affiche le message d'erreur et on arrête la fonction
    showFormError(errorMessage);
    return;
  }

  // Pas d'erreur : on détermine si on est en mode ajout ou modification
  if (editingTaskId !== null) {
    // Mode modification : on met à jour la tâche existante
    updateTask(editingTaskId, data);
    editingTaskId = null; // On repasse en mode "Ajout" après la modification
  } else {
    // Mode ajout : on crée une nouvelle tâche
    addTask(data);
  }

  // On remet le formulaire en mode "Ajout" et on vide les champs (depuis form.js)
  resetForm();

  // On rafraîchit la liste pour que les changements apparaissent
  renderTasks();
});

/**
 * Clic sur le bouton "Annuler"
 *
 * Cet écouteur est déclenché quand l'utilisateur veut annuler une modification
 * en cours. Il remet editingTaskId à null et réinitialise le formulaire en mode "Ajout".
 */
cancelBtn.addEventListener("click", () => {
  editingTaskId = null; // On oublie qu'on était en train de modifier une tâche
  resetForm();          // On remet le formulaire en mode "Ajout" (depuis form.js)
});

/**
 * Changement du filtre
 *
 * Cet écouteur est déclenché quand l'utilisateur change l'option dans le menu
 * déroulant "Toutes / En cours / Terminées". Il appelle renderTasks() directement
 * pour rafraîchir la liste avec le nouveau filtre appliqué.
 */
filterSelect.addEventListener("change", renderTasks);

// ---- Chargement initial ----
// On appelle renderTasks() une première fois au chargement de la page
// pour afficher les tâches déjà sauvegardées dans le localStorage.
renderTasks();

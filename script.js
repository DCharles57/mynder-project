// MyNDER Lite MVP
// Spine: input -> simple priority logic -> ordered output
// Persistence: localStorage

const STORAGE_KEY = "mynder_lite_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDue = document.getElementById("taskDue");
const taskMins = document.getElementById("taskMins");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const organizeBtn = document.getElementById("organizeBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = loadTasks();

render(tasks);

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskTitle.value.trim();
  const due = taskDue.value;
  const mins = Number(taskMins.value);

  if (!title || !due || !Number.isFinite(mins) || mins <= 0) return;

  const newTask = {
    id: crypto.randomUUID(),
    title,
    due,
    mins,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks(tasks);
  render(tasks);

  taskTitle.value = "";
  taskTitle.focus();
});

organizeBtn.addEventListener("click", () => {
  // Sort by urgency score (higher first), then sooner due date
  const organized = [...tasks].sort((a, b) => {
    const scoreA = urgencyScore(a);
    const scoreB = urgencyScore(b);

    if (scoreB !== scoreA) return scoreB - scoreA;

    // tie-breaker: earlier due date first
    return new Date(a.due) - new Date(b.due);
  });

  tasks = organized;
  saveTasks(tasks);
  render(tasks);
});

clearAllBtn.addEventListener("click", () => {
  tasks = [];
  saveTasks(tasks);
  render(tasks);
});

function urgencyScore(task) {
  // Simple scoring:
  // - fewer days left => higher urgency
  // - longer tasks => slightly higher urgency
  // This mimics "AI-assisted prioritization" with transparent rules.

  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.due));
  const msPerDay = 24 * 60 * 60 * 1000;

  const daysLeft = Math.ceil((dueDate - today) / msPerDay);

  // Base urgency from days left
  // overdue => very urgent
  let base;
  if (daysLeft < 0) base = 100;
  else if (daysLeft === 0) base = 80;
  else if (daysLeft === 1) base = 60;
  else if (daysLeft <= 3) base = 45;
  else if (daysLeft <= 7) base = 30;
  else base = 15;

  // Effort bonus: larger tasks get a small boost
  const effortBonus = Math.min(25, Math.floor(task.mins / 30) * 5);

  return base + effortBonus;
}

function render(list) {
  taskList.innerHTML = "";

  if (!list.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  for (const [index, task] of list.entries()) {
    const li = document.createElement("li");
    li.className = "taskItem";

    const score = urgencyScore(task);
    const daysLeft = daysUntil(task.due);
    const label = daysLeftLabel(daysLeft);

    li.innerHTML = `
      <div class="taskTop">
        <strong>${escapeHtml(task.title)}</strong>
        <div class="badges">
          <span class="badge">Due: ${escapeHtml(task.due)}</span>
          <span class="badge">Est: ${task.mins}m</span>
          <span class="badge">Urgency: ${score}</span>
          <span class="badge">${escapeHtml(label)}</span>
        </div>
      </div>
    `;
const doneBtn = document.createElement("button");
doneBtn.className = "remove-btn";
doneBtn.type = "button";
doneBtn.textContent = "Done";
doneBtn.addEventListener("click", () => removeTask(index));

li.appendChild(doneBtn);
taskList.appendChild(li);
  }
}

function daysUntil(due) {
  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(due));
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((dueDate - today) / msPerDay);
}

function daysLeftLabel(daysLeft) {
  if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)}d`;
  if (daysLeft === 0) return "Due today";
  if (daysLeft === 1) return "Due tomorrow";
  return `${daysLeft}d left`;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function saveTasks(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function removeTask(index) {
  tasks.splice(index, 1);
  saveTasks(tasks);
  render(tasks);
}
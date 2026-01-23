
// MyNDER Lite MVP
// Spine: input -> simple priority logic -> ordered output
// Persistence: localStorage
// ===== MyNDER Copy Skin (Calm / Motivate / Humor) =====
const COPY = {
  
  calm: {
    heroTitle: "MyNDER Lite",
    heroSub: "Too much in your head? Drop it here. We’ll pick one clear next step.",
    addSectionTitle: "What’s on your mind?",
    taskLabel: "One thought or task",
    taskPlaceholder: "e.g., finish assignment, call mom, clean room",
    dueLabel: "Due date",
    minutesLabel: "Rough time (no pressure)",
    addBtn: "Add it",
    clearBtn: "Start fresh",
    listTitle: "What you’ve added",
    emptyState: "Nothing here yet — that’s okay. Start with one small thing.",
    decideBtn: "Help me decide"
  },
  

  motivate: {
    heroTitle: "MyNDER Lite",
    heroSub: "Let’s get one win today. Add what’s on your plate — I’ll help you choose what matters first.",
    addSectionTitle: "Add your next win",
    taskLabel: "Task",
    taskPlaceholder: "e.g., submit assignment, meal prep, apply to 1 job",
    dueLabel: "Due date",
    minutesLabel: "Time estimate",
    addBtn: "Add task",
    clearBtn: "Reset list",
    listTitle: "Your game plan",
    emptyState: "Start with one task. Momentum comes fast.",
    decideBtn: "Pick my first move"
  },
  humor: {
    heroTitle: "MyNDER Lite",
    heroSub: "Brain doing 37 tabs again? Dump it here — we’ll pick one thing before you start a new life in your head.",
    addSectionTitle: "What’s stressing you out today?",
    taskLabel: "Drop it here",
    taskPlaceholder: "e.g., ‘be productive’ (lol), finish assignment, call dentist",
    dueLabel: "Due date",
    minutesLabel: "How long (roughly)?",
    addBtn: "Add it",
    clearBtn: "Nuke everything",
    listTitle: "The list (unfortunately)",
    emptyState: "No tasks yet. That’s either peace… or denial. Add one 😭",
    decideBtn: "Tell me what to do"
  }
};
const EMPTY_STATE_MESSAGES = [
  // Calm
  "Nothing here yet — that’s okay. Start with one small thing.",

  // Motivation
  "Momentum starts with one move. What’s your next win?",

  // Humor
  "Your list is empty. That’s not procrastination… that’s potential."
];
function applyCopySkin() {
  const moods = ["calm", "motivate", "humor"];
  const mood = moods[Math.floor(Math.random() * moods.length)];
  const c = COPY[mood];

  // helper: set text if element exists
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  };

  // helper: set placeholder if element exists
  const setPlaceholder = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null) el.setAttribute("placeholder", value);
  };

  setText("heroTitle", c.heroTitle);
  setText("heroSub", c.heroSub);
  setText("addSectionTitle", c.addSectionTitle);

  setText("taskLabel", c.taskLabel);
  setPlaceholder("taskInput", c.taskPlaceholder);

  setText("dueLabel", c.dueLabel);
  setText("minutesLabel", c.minutesLabel);

  setText("addBtn", c.addBtn);
  setText("clearBtn", c.clearBtn);

  setText("listTitle", c.listTitle);
  setText("emptyState", c.emptyState);
  setText("decideBtn", c.decideBtn);

  // Optional: expose for debugging
  // console.log("MyNDER mood:", mood);
}

// Run after DOM is ready so IDs exist
let emptyStateInterval = null;

function rotateEmptyState() {
  const emptyEl = document.getElementById("emptyState");
  if (!emptyEl) return;

  let index = 0;
  emptyEl.textContent = EMPTY_STATE_MESSAGES[index];

  // Clear any existing rotation
  if (emptyStateInterval) {
    clearInterval(emptyStateInterval);
  }

  emptyStateInterval = setInterval(() => {
    emptyEl.classList.remove("fade-in");
    emptyEl.classList.add("fade-out");

    setTimeout(() => {
      index = (index + 1) % EMPTY_STATE_MESSAGES.length;
      emptyEl.textContent = EMPTY_STATE_MESSAGES[index];
      emptyEl.classList.remove("fade-out");
      emptyEl.classList.add("fade-in");
    }, 300);
  }, 6000);
}

document.addEventListener("DOMContentLoaded", () => {
  applyCopySkin();
  rotateEmptyState();
});

const STORAGE_KEY = "mynder_lite_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDue = document.getElementById("taskDue");
const taskMins = document.getElementById("taskMins");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const organizeBtn = document.getElementById("organizeBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = loadTasks();
render(tasks);
if (tasks.length === 0) {
  rotateEmptyState();   // resume when empty
} else {
  stopEmptyState();     // pause when tasks exist
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskInput.value.trim();
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

taskInput.value = "";
taskInput.focus();

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



// 🔁 Pause / resume empty-state rotation

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function removeTask(index) {
  function removeTask(index) {
  tasks.splice(index, 1);
  saveTasks(tasks);
  render(tasks);

  if (tasks.length === 0) rotateEmptyState();
  else stopEmptyState();
}

}
function softClick() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = softClick.ctx || (softClick.ctx = new AudioCtx());

  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "sine";
  o.frequency.setValueAtTime(520, ctx.currentTime);

  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

  o.connect(g);
  g.connect(ctx.destination);

  o.start();
  o.stop(ctx.currentTime + 0.09);
}

document.getElementById("helpDecideBtn")?.addEventListener("click", softClick);
document.getElementById("decideBtn")?.addEventListener("click", softClick);


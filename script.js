

// 👇 ADD THIS LINE
let chosenTaskId = null;

// Empty state rotation control
let emptyStateInterval = null;

function rotateEmptyState() {
  if (emptyStateInterval) return;

  emptyStateInterval = setInterval(() => {
    // optional: rotate text / animation later
  }, 2500);
}

function stopEmptyState() {
  if (!emptyStateInterval) return;
  clearInterval(emptyStateInterval);
  emptyStateInterval = null;
}

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
const taskMins = document.getElementById("taskMins");      // ✅ minutes input
const taskList = document.getElementById("taskList");      // ✅ the <ol>
const emptyState = document.getElementById("emptyState");  // ✅ the empty message div

const decideBtn = document.getElementById("decideBtn");    // if it exists
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
  const due = taskDue.value || null;
  const mins = Number(taskMins.value);

  // guard clauses
  if (!title) return;
  if (!Number.isFinite(mins) || mins <= 0) return;

  const newTask = {
    id: crypto.randomUUID(),
    title,
    due,
    mins,
    createdAt: new Date().toISOString(),
    done: false,
  };

  // update state
  tasks.push(newTask);
  saveTasks(tasks);
  render(tasks);

  // reset UI
  taskForm.reset();
  taskMins.value = 30;
  stopEmptyState();
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
  chosenTaskId = tasks[0].id;
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

  if (!list || !list.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  // SAFE fallbacks so render can never crash
  const safeEscape = (v) =>
    (typeof escapeHtml === "function")
      ? escapeHtml(String(v ?? ""))
      : String(v ?? "");

  const safeUrgency = (t) =>
    (typeof urgencyScore === "function") ? urgencyScore(t) : 0;

  const safeDaysUntil = (d) =>
    (typeof daysUntil === "function") ? daysUntil(d) : null;

  const safeDaysLabel = (n) =>
    (typeof daysLeftLabel === "function") ? daysLeftLabel(n) : "";

  list.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "taskItem";

    if (typeof chosenTaskId !== "undefined" && task.id === chosenTaskId) {
      li.classList.add("chosen");
    }

    const score = safeUrgency(task);
    const daysLeft = safeDaysUntil(task.due);
    const label = safeDaysLabel(daysLeft);

    const urgencyClass =
      score >= 80 ? "u-high" :
      score >= 50 ? "u-med"  :
      "u-low";

    li.innerHTML = `
      <div class="taskRow">
        <div class="taskMain">
          <span class="taskTitle">${safeEscape(task.title)}</span>

          <div class="badges">
            <span class="badge">Due: ${task.due ? safeEscape(task.due) : "—"}</span>
            <span class="badge">Est: ${Number(task.mins) || 0}m</span>
            <span class="badge ${urgencyClass}">Urgency: ${score}</span>
            <span class="badge">${safeEscape(label)}</span>
          </div>
        </div>

        <button class="doneBtn" type="button">Done</button>
      </div>
    `;

    taskList.appendChild(li);

    // entry animation (safe even if CSS missing)
    requestAnimationFrame(() => li.classList.add("is-entered"));

    li.querySelector(".doneBtn").addEventListener("click", () => {
      removeTask(index);
    });
  });
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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    // Keep only valid tasks (prevents {} from breaking UI)
    return parsed.filter(t =>
      t &&
      typeof t.title === "string" &&
      t.title.trim().length > 0 &&
      Number.isFinite(Number(t.mins)) &&
      Number(t.mins) > 0
    ).map(t => ({
      id: t.id || crypto.randomUUID(),
      title: t.title.trim(),
      due: t.due || null,
      mins: Number(t.mins),
      createdAt: t.createdAt || new Date().toISOString(),
      done: Boolean(t.done),
    }));
  } catch (err) {
    console.error("loadTasks failed:", err);
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


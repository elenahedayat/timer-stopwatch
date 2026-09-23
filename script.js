const timeEl = document.getElementById("time");
const editTime = document.getElementById("edit-time");
const editH = document.getElementById("edit-h");
const editM = document.getElementById("edit-m");
const editS = document.getElementById("edit-s");
const lapsEl = document.getElementById("laps");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const lapBtn = document.getElementById("lap");
const tabs = document.querySelectorAll(".tab");

let mode = "stopwatch";
let running = false;
let intervalId = null;

// stopwatch
let elapsed = 0;
let startedAt = 0;
let laps = [];
let lastLapAt = 0;

// timer
let remaining = 60 * 1000;
let endsAt = 0;
let timerStarted = false; 

function format(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function showTime(ms) {
  timeEl.textContent = format(ms);
}

function clearTick() {
  clearInterval(intervalId);
  intervalId = null;
  running = false;
}

function readEdit() {
  const h = Math.max(0, Number(editH.value) || 0);
  const m = Math.min(59, Math.max(0, Number(editM.value) || 0));
  const s = Math.min(59, Math.max(0, Number(editS.value) || 0));
  return (h * 3600 + m * 60 + s) * 1000;
}

function syncEdit() {
  const total = Math.floor(remaining / 1000);
  editH.value = Math.floor(total / 3600);
  editM.value = Math.floor((total % 3600) / 60);
  editS.value = total % 60;
}

function showClock() {
  editTime.hidden = true;
  timeEl.hidden = false;
}

function showEditor() {
  timeEl.hidden = true;
  editTime.hidden = false;
  syncEdit();
}

function renderLaps() {
  lapsEl.innerHTML = "";
  [...laps].reverse().forEach((lap, i, arr) => {
    const item = document.createElement("article");
    item.className = "lap-item";
    item.innerHTML = `<span>Lap ${arr.length - i}</span><strong>${format(lap.total)}</strong><span>+${format(lap.diff)}</span>`;
    lapsEl.append(item);
  });
}

function tickStopwatch() {
  elapsed = Date.now() - startedAt;
  showTime(elapsed);
}

function tickTimer() {
  remaining = endsAt - Date.now();
  if (remaining <= 0) {
    remaining = 0;
    showTime(0);
    clearTick();
    return;
  }
  showTime(remaining);
}

function start() {
  if (running) return;

  if (mode === "stopwatch") {
    startedAt = Date.now() - elapsed;
    intervalId = setInterval(tickStopwatch, 100);
    running = true;
    return;
  }

  // timer
  if (!timerStarted) {
    remaining = readEdit();
  }
  if (remaining <= 0) return;

  timerStarted = true;
  showClock();
  showTime(remaining);

  endsAt = Date.now() + remaining;
  intervalId = setInterval(tickTimer, 100);
  running = true;
}

function stop() {
  if (!running) return;

  if (mode === "stopwatch") {
    elapsed = Date.now() - startedAt;
    showTime(elapsed);
  } else {
    remaining = Math.max(0, endsAt - Date.now());
    showTime(remaining);
    showClock();
  }

  clearTick();
}

function reset() {
  clearTick();

  if (mode === "stopwatch") {
    elapsed = 0;
    lastLapAt = 0;
    laps = [];
    renderLaps();
    showClock();
    showTime(0);
  } else {
    timerStarted = false;
    remaining = readEdit() || 60 * 1000;
    showEditor();
  }
}

function addLap() {
  if (mode !== "stopwatch" || elapsed === 0) return;

  const total = elapsed;
  const diff = total - lastLapAt;
  lastLapAt = total;
  laps.push({ total, diff });
  renderLaps();
}

function switchMode(next) {
  if (next === mode) return;
  clearTick();
  mode = next;

  tabs.forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));

  if (mode === "timer") {
    lapBtn.hidden = true;
    lapsEl.hidden = true;
    lapsEl.innerHTML = "";
    timerStarted = false;
    if (remaining <= 0) remaining = 60 * 1000;
    showEditor(); 
  } else {
    lapBtn.hidden = false;
    lapsEl.hidden = false;
    elapsed = 0;
    lastLapAt = 0;
    laps = [];
    renderLaps();
    showClock();
    showTime(0);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchMode(tab.dataset.mode));
});

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", addLap);

[editH, editM, editS].forEach((input) => {
  input.addEventListener("change", () => {
    if (!timerStarted) remaining = readEdit();
  });
});

showClock();
showTime(0);
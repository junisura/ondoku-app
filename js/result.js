import { formatYMD, guardSameDay } from "./date.js";
import { loadRecords, saveRecords } from "./storage.js";
import { getTodayRecords, sortByCreatedAt, getLastTwoRecords, calcSummary } from "./records.js";

// データ読み込み
const records = loadRecords();
const params = new URLSearchParams(location.search);
const workDate = params.get("date") || formatYMD(new Date());
const today = formatYMD(new Date().toISOString());
guardSameDay(workDate);

// 初期化
async function init() {
  const todayRecords = getTodayRecords(records, workDate);
  const last = todayRecords[todayRecords.length - 1];
  
  document.getElementById("attempt").textContent = todayRecords.length;
  document.getElementById("last-record").textContent =
    `${last.speed.toFixed(2)}文字/秒 （${last.time_sec.toFixed(2)}秒）`;
  document.getElementById("memo").value = last.memo || "";

  const { current, prev } = getLastTwoRecords(records, workDate);
  const el = document.getElementById("prev-speed");

  if (!prev) {
    el.textContent = "なし";
  } else {
    const diff = current.speed - prev.speed;
    el.textContent = `${prev.speed.toFixed(2)}文字/秒`;

    const diffEl = document.getElementById("prev-diff");
    if (diff >= 0) {
      diffEl.textContent = `（+${diff.toFixed(2)}）`;
      diffEl.classList.add("good");
    } else {
      diffEl.textContent = `（-${diff.toFixed(2)}）`;
      diffEl.classList.add("bad");
    }
  }

  const best = Math.max(...records.map(r => r.speed));
  if (last.speed >= best) {
    document.getElementById("best").classList.remove("hidden");
  }

  initRecords();
}

// 各回の記録
function initRecords() {
  const listEl = document.getElementById("records");
  const template = document.getElementById("record-item-template");
  listEl.innerHTML = "";

  const todayRecords = getTodayRecords(records, workDate);
  const sorted = sortByCreatedAt(todayRecords, true);
  sorted.forEach((record, index) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".attempt").textContent = `${record.attempt_index}回目`;
    clone.querySelector(".speed").textContent = `${record.speed.toFixed(2)}文字/秒`;
    clone.querySelector(".time").textContent = `（${record.time_sec.toFixed(2)}秒）`;

    const memoEl = clone.querySelector(".memo");
    if (record.memo) {
      memoEl.textContent = record.memo;
    } else {
      memoEl.style.display = "none";
    }

    listEl.appendChild(clone);
  });
}

init();
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveMemoBtn").addEventListener("click", saveMemo);
  document.getElementById("retryBtn").addEventListener("click", retry);
});

// ボタン
function saveMemo() {
  const todayRecords = getTodayRecords(records, workDate);
  const last = todayRecords[todayRecords.length - 1];
  const memoEl = document.getElementById("memo");
  if (last) {
    last.memo = memoEl.value;
    saveRecords(records);
  }

  const saveMemoBtn = document.getElementById("saveMemoBtn");
  memoEl.style.display ="none";
  saveMemoBtn.style.display ="none";
  document.getElementById("savedMemo").textContent = `一言メモ：　${memoEl.value}`;

  alert("保存しました！");
  
  initRecords();
};

function retry() {
  const url = new URL("measurement.html", location.origin);
  url.searchParams.set("date", workDate);
  location.href = url.toString();
};


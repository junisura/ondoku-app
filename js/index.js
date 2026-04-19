import { formatYMD, formatJpYMD, formatJpMDA } from "./date.js";
import { loadDateMap, saveDateMap, loadRecords } from "./storage.js";
import { loadContents, findContent, ensureTodayContent } from "./contents.js";
import { getBestRecord } from "./records.js";

let today = "";

async function init() {
  // データ読み込み
  const contents = await loadContents();
  const dateMap = loadDateMap();
  const records = loadRecords();

  today = formatYMD(new Date().toISOString());
  const contentId = ensureTodayContent(dateMap, contents, today);
  if (!contentId) return;
  saveDateMap(dateMap);

  const current = findContent(contents, contentId);
  const bestRecord = getBestRecord(records);

  // DOM反映
  document.getElementById("today-date").textContent = formatJpMDA(today);
  document.getElementById("text-title").textContent = current.title;
  document.getElementById("text-category").textContent = current.genre;
  if (bestRecord) {
    document.getElementById("best-record-section").classList.remove("display-none");
    document.getElementById("best-record").textContent = 
      `${bestRecord.speed.toFixed(2)}文字/秒（${bestRecord.time_sec.toFixed(2)}秒）`;
    document.getElementById("best-date").textContent = formatJpYMD(bestRecord.work_date);
  }

}

function openText() {
  const url = new URL("measurement.html", location.href);
  url.searchParams.set("date", today);
  location.href = url.toString();
};

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  await init();
  document.getElementById("openBtn").addEventListener("click", openText);
});

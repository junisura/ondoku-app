import { formatYMD } from "./date.js";
import { loadDateMap, saveDateMap, loadRecords } from "./storage.js";
import { loadContents, findContent, ensureTodayContent } from "./contents.js";
import { getTodayRecords, calcSummary } from "./records.js";

let today = "";

async function init() {
  // データ読み込み
  const contents = await loadContents();
  const dateMap = loadDateMap();
  const records = loadRecords();

  today = formatYMD(new Date().toISOString());
  const contentId = ensureTodayContent(dateMap, contents, today);
  saveDateMap(dateMap);

  const current = findContent(contents, contentId);

  const todayRecords = getTodayRecords(records, today);
  const summary = calcSummary(todayRecords);

  // DOM反映
  document.getElementById("count").textContent = summary.count + " 回";
  document.getElementById("max-speed").textContent =
    summary.max === 0 ? "(未計測)" : summary.max.toFixed(2) + " 文字/秒";
  document.getElementById("avg-speed").textContent =
    summary.avg === 0 ? "(未計測)" : summary.avg.toFixed(2) + " 文字/秒";

  document.getElementById("genre").textContent = `【${current.genre}】`;
  document.getElementById("title").textContent = current.title;

}

init();
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("openBtn").addEventListener("click", openText);
});

function openText() {
  const url = new URL("measurement.html", location.origin);
  url.searchParams.set("date", today);
  location.href = url.toString();
};

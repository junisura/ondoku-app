import { login, getCurrentUser } from "./auth.js";
import { formatYMD, formatJpMDA, formatJpYMD } from "./date.js";
import { findTodayContent } from "./contents.js";
import { getBestRecord } from "./records.js";

let today = "";

async function init() {
  await login("junisura@yahoo.co.jp", "ondock2026");
  const { user, error } = await getCurrentUser();

  today = formatYMD(new Date().toISOString());
  document.getElementById("today-date").textContent = formatJpMDA(today);

  const currentContent = await findTodayContent(today);
  if (currentContent) {
    document.getElementById("text-title").textContent = currentContent.contents.title;
    document.getElementById("text-category").textContent = currentContent.contents.category;
  } else {
    document.getElementById("text-title").textContent = "（教材取得失敗）";
    document.getElementById("text-category").textContent = "";
    document.getElementById("openBtn").disabled = true;
  }

  const bestRecord = await getBestRecord(user.id);
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

import { login, getCurrentUser } from "../lib/auth.js";
import { formatISOToYMD, formatYMDToJPMDA, formatYMDToJP } from "../lib/date.js";
import { getContentByDate } from "../lib/contents.js";
import { getBestRecord } from "../lib/records.js";

let today = "";

async function init() {
  await login("junisura@yahoo.co.jp", "ondock2026");
  const { user, error } = await getCurrentUser();

  today = formatISOToYMD(new Date().toISOString());
  document.getElementById("today-date").textContent = formatYMDToJPMDA(today);

  const currentContent = await getContentByDate(today);
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
    document.getElementById("best-date").textContent = formatYMDToJP(bestRecord.work_date);
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

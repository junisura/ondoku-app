import { login, getCurrentUser, logout } from "../lib/auth.js";
import { formatISOToYMD, formatYMDToJPMDA, formatYMDToJP } from "../lib/date.js";
import { getCachedTodayContent } from "../lib/contents.js";
import { getRecordsCountByDate, getBestRecord } from "../lib/records.js";

let today = "";

async function init() {
  const { user, error } = await getCurrentUser();

  today = formatISOToYMD(new Date().toISOString());
  document.getElementById("today-date").textContent = formatYMDToJPMDA(today);

  const currentContent = await getCachedTodayContent(today);
  if (currentContent) {
    document.getElementById("text-title").textContent = currentContent.contents.title;
    document.getElementById("text-category").textContent = currentContent.contents.category;
    document.getElementById("openBtn").disabled = false;
  } else {
    document.getElementById("text-title").textContent = "（教材取得失敗）";
    document.getElementById("text-category").textContent = "";
    document.getElementById("openBtn").disabled = true;
  }

  const recCount = await getRecordsCountByDate(today);
  if (recCount > 0) {
    document.getElementById("records-count").textContent = `このテキストは本日${recCount}回読まれました`;
  } else {
    document.getElementById("records-count").textContent = `今日最初の音読をしてみませんか？`;
  }

  if (user) {
    const bestRecord = await getBestRecord(user.id);
    if (bestRecord) {
      document.getElementById("best-record-section").classList.remove("display-none");
      document.getElementById("best-record").textContent = 
        `${bestRecord.speed.toFixed(2)}文字/秒（${bestRecord.time_sec.toFixed(2)}秒）`;
      document.getElementById("best-date").textContent = formatYMDToJP(bestRecord.work_date);
    }
    document.getElementById("historyBtn").classList.remove("display-none");
    document.getElementById("logoutBtn").classList.remove("display-none");
  } else {
    document.getElementById("loginBtn").classList.remove("display-none");
  }

}

function openText() {
  const url = new URL("measurement.html", location.href);
  url.searchParams.set("date", today);
  location.href = url.toString();
};

async function loggedOut() {
  await logout();
  location.href = "./login.html";
};

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  await init();
  document.getElementById("openBtn").addEventListener("click", openText);
  document.getElementById("logoutBtn").addEventListener("click", loggedOut);
});

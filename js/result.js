import { getCurrentUser } from "./auth.js";
import { formatYMD, formatTimeMs } from "./date.js";
import { guardTodayContent } from "./contents.js";
import { findRecordById, getTodayRecords, getPrevRecord, getBestRecord, updateRecordMemo } from "./records.js";
import { renderRecordList } from "./recordList.js";

// データ読み込み
let lastRecId;
let today;
let todayRecords;
let memoInput = null;
let memoOutput = null;

// 初期化
async function init() {
console.log(location.href);
console.log(location.search);

const params = new URLSearchParams(location.search);
console.log(params.get("rec_id"));

  const { user, error } = await getCurrentUser();

//  const params = new URLSearchParams(location.search);
  lastRecId = params.get("rec_id");
  if (!lastRecId) {
    alert("計測記録がありません。TOPに戻ります");
    location.href = "index.html";
    return;
  }

  const lastRec = await findRecordById(user.id, lastRecId);
  today = lastRec.work_date;
  todayRecords = await getTodayRecords(user.id, today);

  const isValid = await guardTodayContent(lastRec.content_id, today);
  if (!isValid) {
    alert("データ不整合が発生しました。TOP画面からやり直してください。");
    location.href = "index.html";
  }

  const lastTime = formatTimeMs(lastRec.time_sec);
  document.getElementById("last__time").textContent = lastTime;
  document.getElementById("last__speed").textContent = `（${lastRec.speed.toFixed(2)}文字/秒）`;

  memoInput = document.getElementById("memo__input");
  memoOutput = document.getElementById("memo__output");
  if (lastRec.memo) {
    memoOutput.textContent = `メモ：　${lastRec.memo}`;
    switchMemoDisplay(true);
  }

  // 前回比較
  const prev = await getPrevRecord(user.id, lastRec);
  if (prev) {
    document.getElementById("diff-card").classList.remove("display-none");
    document.getElementById("prev__time").textContent = formatTimeMs(prev.time_sec);
    document.getElementById("prev__speed").textContent = `（${prev.speed.toFixed(2)}文字/秒）`;

    const diff = lastRec.time_sec - prev.time_sec;
    const diffTime = document.getElementById("diff__time");
    const diffDisplay = getDiffDisplay(diff);

    diffTime.textContent = diffDisplay.text;
    if (diffDisplay.className) {
      diffTime.classList.add(diffDisplay.className);
    }
  }

  // 自己ベスト表示ロジック
  const bestRecord = await getBestRecord(user.id);
  if (lastRec.speed >= bestRecord.speed) {
    document.getElementById("best-updated").classList.remove("display-none");
  }

  // 結果一覧を描画
  renderRecordList(todayRecords);
}

function getDiffDisplay(diff) {
  if (diff > 0) {
    return {
      text: `${formatTimeMs(diff)} 速度DOWN...`,
      className: "text-danger",
    };
  }

  if (diff < 0) {
    return {
      text: `${formatTimeMs(diff)} 速度UP!`,
      className: "text-success",
    };
  }

  return {
    text: formatTimeMs(diff),
    className: "",
  };
}

// ボタン
async function saveMemo() {
  if (!memoInput.value) return;

  const { user, error } = await getCurrentUser();
  const lastRec = await findRecordById(user.id, lastRecId);
  lastRec.memo = memoInput.value;
  await updateRecordMemo(user.id, lastRecId, memoInput.value);

  memoOutput.textContent = `メモ：　${memoInput.value}`;
  switchMemoDisplay(true);
  alert("保存しました！");

  // 結果一覧を描画
  renderRecordList(todayRecords);
};

function retry() {
  const url = new URL("measurement.html", location.href);
  url.searchParams.set("date", today);
  location.href = url.toString();
};

function switchMemoDisplay(isOutput) {
  if (isOutput) {
    document.getElementById("saveMemoBtn").classList.add("display-none");
    memoInput.classList.add("display-none");
    memoOutput.classList.remove("display-none");
  } else {
    document.getElementById("saveMemoBtn").classList.remove("display-none");
    memoInput.classList.remove("display-none");
    memoOutput.classList.add("display-none");
  }
}

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  await init();
  document.getElementById("saveMemoBtn").addEventListener("click", saveMemo);
  document.getElementById("retryBtn").addEventListener("click", retry);
});

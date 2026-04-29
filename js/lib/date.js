const weekDay = ["日", "月", "火", "水", "木", "金", "土"];

export function parseYMD(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatMsToTime(sec) {
  // const sign = sec < 0 ? "-" : "";
  const abs = Math.abs(sec);

  const m = Math.floor(abs / 60);
  const s = Math.floor(abs % 60);
  const ms = Math.floor((abs % 1) * 100); // 小数2桁

  // 符号出す場合は先頭に ${sign} を追加
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

export function formatISOToYMD(iso) {
  const date = new Date(iso);

  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  return `${map.year}-${map.month}-${map.day}`;
}

export function formatISOToHM(iso) {
  const date = new Date(iso);

  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  return `${map.hour}:${map.minute}`;
}

export function formatYMDToJP(ymd) {
  const date = parseYMD(ymd);

  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).formatToParts(date);

  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  return `${map.year}年${map.month}月${map.day}日`;
}

export function formatYMDToJPMDA(ymd) {
  const date = parseYMD(ymd);

  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric"
  }).formatToParts(date);

  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  map.weekday = weekDay[date.getDay()];

  return `${map.month}月${map.day}日（${map.weekday}）`;
}

export function isSameDay(workDate) {
  const today = formatISOToYMD(new Date().toISOString());

  if (!workDate || workDate !== today) {
    console.error("content_id_invalid", { contentId, workDate, expected });
    alert("日付が変わったためセッションを終了します");
    location.href = "index.html";
    return false;
  }

  return true;
}

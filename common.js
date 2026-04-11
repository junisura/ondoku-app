window.Common = {
  formatTimeMs(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100); // 小数2桁
  
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  },
  formatYMDhms(iso) {
    const date = new Date(iso);
  
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).formatToParts(date);
  
    const map = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }
  
    return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
  },
  formatYMD(iso) {
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
};

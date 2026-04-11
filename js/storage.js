const KEYS = {
  RECORDS: "ondoku_records",
  DATE_MAP: "ondoku_date_map",
};

export function loadRecords() {
  return JSON.parse(localStorage.getItem(KEYS.RECORDS) || "[]");
}

export function saveRecords(records) {
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
}

export function loadDateMap() {
  return JSON.parse(localStorage.getItem(KEYS.DATE_MAP) || "{}");
}

export function saveDateMap(map) {
  localStorage.setItem(KEYS.DATE_MAP, JSON.stringify(map));
}

export function getTodayRecords(records, today) {
  return records.filter(r => r.work_date === today);
}

export function getSortedByCreatedAt(records, isDesc = false) {
  const sorted = [...records].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );

  return isDesc ? sorted.reverse() : sorted;
}

export function getLastTwoRecords(records, workDate) {
  const list = records
    .filter(r => r.work_date === workDate)
    .sort((a, b) => a.attempt_index - b.attempt_index);

  if (list.length === 0) return { current: null, prev: null };

  const current = list[list.length - 1];
  const prev = list[list.length - 2] ?? null;

  return { current, prev };
}

export function calcSummary(records) {
  const count = records.length;
  if (count === 0) return { count: 0, max: 0, avg: 0 };

  const speeds = records.map(r => r.speed);
  const max = Math.max(...speeds);
  const avg = speeds.reduce((a, b) => a + b, 0) / count;

  return { count, max, avg };
}

export function getBestRecord(records) {
  if (!records || records.length === 0) return null;

  let best = records[0];

  for (const r of records) {
    if (
      r.speed > best.speed ||
      (r.speed === best.speed && r.created_at > best.created_at)
    ) {
      best = r;
    }
  }

  return best;
}

export function generateId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function calcStreak(records) {
  if (!records || records.length === 0) return 0;

  // 重複除去して日付だけ抽出
  const dates = [...new Set(records.map(r => r.work_date))];

  // 昇順ソート
  dates.sort();

  let streak = 1;

  for (let i = dates.length - 1; i > 0; i--) {
    const current = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);

    const diff =
      (current - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

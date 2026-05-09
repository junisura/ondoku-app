import { selectBestRecord, insertRecord, selectRecordById, selectRecordsByDate, selectRecordsCountByDate, selectPreviousRecord, updateMemo, selectRecordedDates } from "./repository.js";
import { formatISOToYMD } from "./date.js";

export async function getBestRecord(userId) {
  const { data, error } = await selectBestRecord(userId);
  if (error) {
    console.error("best_records_fetch_error", { userId, error });
    return null;
  }
  return data;
}

export async function createRecord(record) {
  const { data, error } = await insertRecord(record);

  if (error) {
    console.error(error);
    throw new Error("record_insert_error", { record, error });
  }

  return data;
}

export async function findRecordById(userId, recId) {
  const { data, error } = await selectRecordById(userId, recId);

  if (error || !data) {
    console.error("record_not_found", { userId, recId, error });
    return null;
  }

  return data;
}

export async function getRecordsByDate(userId, today) {
  const { data, error } = await selectRecordsByDate(userId, today);

  if (error) {
    console.error("records_fetch_error", { userId, today, error });
    return null;
  }

  return data;
}

export async function getRecordsCountByDate(today) {
  const { data, error } = await selectRecordsCountByDate(today);

  if (error) {
    console.error("records_count_fetch_error", { today, error });
    return null;
  }

  return data;
}

export async function getPrevRecord(userId, currentRec) {
  const { data, error } = await selectPreviousRecord(userId, currentRec.created_at);

  if (error) {
    console.error("prev_record_fetch_error", { userId, currentRec, error });
    return null;
  }

  return data;
}

export async function updateRecordMemo(userId, recId, memo) {
  const { data, error } = await updateMemo(userId, recId, memo);

  if (error) {
    console.error(error);
    throw new Error("memo_update_error", { userId, recId, memo, error});
  }

  return data;
}

export async function getRecordsByPeriod(userId, fromDate, toDate) {
  const { data, error } = await selectRecordedDates(userId, fromDate, toDate);

  if (error) {
    console.error("period_records_error", { userId, fromDate, toDate, error });
    return null;
  }

  // 結果が二次元配列なので一次元配列に変換
  return new Set(data.map(r => r.work_date));
}

export async function getStreakContext(userId, toDate) {
  const startDate = "2026-05-09";

  const { data, error } = await selectRecordedDates(userId, startDate, toDate);

  if (error) {
    console.error("streak_context_error", error);
    return null;
  }

  const dateSet = new Set(data.map(r => r.work_date));

  return { dateSet };
}

export async function calcCurrentStreak(userId, toDate) {
  const ctx = await getStreakContext(userId, toDate);
  if (!ctx) return null;

  const { dateSet } = ctx;

  let streak = 0;
  let cursor = new Date(toDate);

  while (dateSet.has(formatISOToYMD(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function calcMaxStreak(userId, toDate) {
  const ctx = await getStreakContext(userId, toDate);
  if (!ctx) return null;

  const dates = Array.from(ctx.dateSet).sort();

  let max = 0;
  let current = 0;
  let prev = null;

  for (const d of dates) {
    const date = new Date(d);

    if (prev) {
      const diff = (date - prev) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        current++;
      } else {
        current = 1;
      }
    } else {
      current = 1;
    }

    max = Math.max(max, current);
    prev = date;
  }

  return max;
}

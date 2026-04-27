const supabaseUrl = "https://aewxjfbrpipgfpciolar.supabase.co";
const supabaseKey = "sb_publishable_4Y4JD3wTANVOc-iV7OG-fg_v7Jsn5Hy";

export const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

export async function fetchOneContent(contentId) {
  return await supabase
    .from("contents")
    .select("*")
    .eq("id", Number(contentId))
    .single();
}

export async function fetchContentId(workDate) {
  return await supabase
    .from("daily_contents")
    .select("content_id")
    .eq("work_date", workDate)
    .single();
}

export async function fetchDailyContent(workDate) {
  return await supabase
    .from("daily_contents")
    .select(`
      work_date,
      content_id,
      contents (
        id,
        title,
        category,
        text_body,
        char_count
      )
    `)
    .eq("work_date", workDate)
    .single();
}

export async function fetchRecordById(userId, recId) {
  return await supabase
    .from("records")
    .select("*")
    .eq("id", recId)
    .eq("user_id", userId)
    .single();
}

export async function fetchDayRecords(userId, workDate) {
  return await supabase
    .from("records")
    .select("*")
    .eq("user_id", userId)
    .eq("work_date", workDate)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
}

export async function insertRecord(record) {
  // 挿入したレコードを返却する
  return await supabase
    .from("records")
    .insert([record])
    .select()
    .single();
}

export async function updateMemo(userId, recId, memo) {
  return await supabase
    .from("records")
    .update({ memo })
    .eq("id", recId)
    .eq("user_id", userId);
}

export async function fetchBestRecord(userId) {
  return await supabase
    .from("records")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("speed", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function findPreviousRecord(userId, createdAt) {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .lt("created_at", createdAt)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

export async function fetchRecordedDates(userId, fromDate, toDate) {
  return await supabase
    .from("records")
    .select("work_date")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .gte("work_date", fromDate)
    .lte("work_date", toDate)
    .order("work_date");
}
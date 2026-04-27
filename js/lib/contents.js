import { selectContentIdByDate, selectContentById, selectDailyContent } from "./repository.js";

export async function getContentIdByDate(workDate) {
  const { data, error } = await selectContentIdByDate(workDate);

  if (error || !data) {
    console.error("contentID_not_found", { workDate, error });
  }

  return data.content_id;
}

export async function getContentByDate(workDate) {
  const { data, error } = await selectDailyContent(workDate);

  if (error || !data) {
    console.error("content_not_found", { workDate, error });
  }
  // dataの中身： {work_date, content_id, contents}
  return data;
}

export async function validateContentForDate(contentId, workDate) {
  const expected = await getContentIdByDate(workDate);
  if (!contentId || Number(contentId) !== expected) {
    console.error("contentID_invalid", { contentId, workDate });
    return false;
  }
  
  return true;
}
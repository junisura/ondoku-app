export async function loadContents() {
  const res = await fetch("./contents.json");
  return await res.json();
}

export function findContent(contents, contentId) {
  return contents.find(c => c.id === contentId);
}

// 指定日のdateMapが無かった時に最大値+1で追加
export function ensureTodayContent(dateMap, contents, workDate) {
  if (!dateMap[workDate]) {
    const dates = Object.keys(dateMap);
    let nextContentId = 1;

    if (dates.length > 0) {
      const latest = dates.sort().reverse()[0];
      nextContentId = dateMap[latest] + 1;
    }

    dateMap[workDate] = nextContentId;
  }

  return dateMap[workDate];
}
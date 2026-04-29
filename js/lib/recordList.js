import { formatMsToTime, formatISOToHM } from "./date.js";

export function renderRecordList(records) {
  const list = document.getElementById("records");
  const template = document.getElementById("list-item-template");

  list.innerHTML = "";

  const bestRecord = getBestRecordFromList(records);

  records.forEach((record) => {
    const clone = template.content.cloneNode(true);

    if (
      bestRecord &&
      bestRecord.attempt_index === record.attempt_index
    ) {
      clone.querySelector(".list__item").classList.add("is-best");
      clone.querySelector(".item__best").textContent = "crown";
    }

    clone.querySelector(".item__timestamp").textContent = formatISOToHM(record.created_at);
    clone.querySelector(".item__time").textContent = formatMsToTime(record.time_sec);
    clone.querySelector(".speed").textContent = record.speed.toFixed(2);

    const memoEl = clone.querySelector(".item__memo");
    const toggleBtn = clone.querySelector(".memo-toggle");

    if (record.memo) {
      memoEl.textContent = record.memo;
      requestAnimationFrame(() => {
        const isOverflowing = memoEl.scrollHeight > memoEl.clientHeight;
        if (!isOverflowing) {
          toggleBtn.classList.add("display-none");
        }
      });
      toggleBtn.addEventListener("click", () => {
        toggleBtn.closest(".record-memo").classList.toggle("expanded");
      });
    } else {
      memoEl.classList.add("display-none");
      toggleBtn.classList.add("display-none");
    }

    list.appendChild(clone);
  });
}

function getBestRecordFromList(records) {
  if (!records || records.length === 0) return null;

  return records.reduce((best, current) => {
    return current.speed > best.speed ? current : best;
  });
}

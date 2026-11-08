export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(
  dateString,
  options = { day: "numeric", month: "short", year: "numeric" },
) {
  return new Intl.DateTimeFormat("en-IN", options).format(
    new Date(`${dateString}T00:00:00`),
  );
}

export function formatRange(start, end) {
  if (start === end) {
    return formatDate(start);
  }

  const startDate = new Date(`${start}T00:00:00`);
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);

  if (sameMonth) {
    return `${startDate.getDate()} ${startDate.toLocaleString("en-IN", { month: "short" })} – ${formatDate(end)}`;
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
}

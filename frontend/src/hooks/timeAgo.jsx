function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000); // in seconds

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return `${Math.floor(diff / 86400)}d`; // less than 2 days

  // 2 days or more: return local date format
  return past.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default timeAgo;

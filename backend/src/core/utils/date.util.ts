export function formatClickhouseDate(isoDateString: string): string {
  if (!isoDateString) return isoDateString;
  // If it's already in the format YYYY-MM-DD HH:mm:ss, return as is
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(isoDateString)) {
    return isoDateString;
  }
  // Convert ISO string '2026-09-29T08:39:09.970Z' to '2026-09-29 08:39:09'
  return isoDateString.substring(0, 19).replace('T', ' ');
}

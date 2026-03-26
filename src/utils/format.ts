export const formatDistanceKm = (
  meters: number | null | undefined,
  fractionDigits = 1
): string => {
  if (meters == null || Number.isNaN(meters)) return "-";
  return `${(meters / 1000).toFixed(fractionDigits)}km`;
};

export const formatMeters = (
  meters: number | null | undefined,
  fractionDigits = 0
): string => {
  if (meters == null || Number.isNaN(meters)) return "-";
  return `${meters.toFixed(fractionDigits)}m`;
};

export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds == null || Number.isNaN(seconds)) return "-";

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  return `${minutes}분`;
};

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

export const formatNumber = (
  value: number | null | undefined,
  fractionDigits = 0
): string => {
  if (value == null || Number.isNaN(value)) return "-";
  return value.toFixed(fractionDigits);
};

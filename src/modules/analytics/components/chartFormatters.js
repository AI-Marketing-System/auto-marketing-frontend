export const getTimeUnitLabel = (timeGranularity) =>
  timeGranularity === 'hour' ? 'giờ' : 'ngày';

export const formatChartLabel = (value, timeGranularity) => {
  const rawValue = String(value ?? '');

  if (timeGranularity !== 'hour') return rawValue;

  const timeMatch = rawValue.match(/(?:T|\s)(\d{1,2})(?::(\d{2}))?/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2] || '00'}`;
  }

  const shortTimeMatch = rawValue.match(/^(\d{1,2})(?::(\d{2}))?/);
  if (shortTimeMatch) {
    return `${shortTimeMatch[1].padStart(2, '0')}:${shortTimeMatch[2] || '00'}`;
  }

  return rawValue;
};

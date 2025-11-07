// Simple timezone offset calculator
const getTimezoneOffset = (timezone) => {
  try {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    return offset;
  } catch (error) {
    return 0; // Default to UTC if error
  }
};

// Calculate timezone proximity score (0-100)
const calculateTimezoneProximity = (tz1, tz2) => {
  const offset1 = getTimezoneOffset(tz1);
  const offset2 = getTimezoneOffset(tz2);
  
  const diff = Math.abs(offset1 - offset2);
  
  if (diff === 0) return 100;
  if (diff <= 3) return 80;
  if (diff <= 6) return 60;
  if (diff <= 9) return 40;
  return 20;
};

module.exports = {
  getTimezoneOffset,
  calculateTimezoneProximity
};

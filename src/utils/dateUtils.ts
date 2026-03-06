
export const getTodayDate = () => {
  const now = new Date();
  // Bangladesh is UTC+6
  // Using Intl.DateTimeFormat to get the date in Asia/Dhaka timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // en-CA format is YYYY-MM-DD
  return formatter.format(now);
};

export const formatBDTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const getBDTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
};

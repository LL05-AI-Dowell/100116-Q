export const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}_${month}_${day}`;
  // return "2024_02_29";
};

export const getTimeZone = () => {
  const currentDate = new Date();
  const timeZoneOffsetInMinutes = currentDate.getTimezoneOffset();
  const timeZoneOffsetHours = timeZoneOffsetInMinutes / 60;

  const sign = timeZoneOffsetHours >= 0 ? "-" : "+";
  const absOffsetHours = Math.abs(timeZoneOffsetHours);

  const timeZoneString = `${sign}${String(absOffsetHours).padStart(
    2,
    "0"
  )}:${String(Math.abs(timeZoneOffsetInMinutes % 60)).padStart(2, "0")}`;

  return timeZoneString;
};

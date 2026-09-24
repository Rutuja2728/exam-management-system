const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isValidTime(value) {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

function timeToMinutes(value) {
  const [, hours, minutes] = value.match(TIME_PATTERN);
  return Number(hours) * 60 + Number(minutes);
}

function assertEndTimeAfterStart(startTime, endTime) {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return;
  }
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    const error = new Error('End time must be later than start time');
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  TIME_PATTERN,
  isValidTime,
  timeToMinutes,
  assertEndTimeAfterStart
};

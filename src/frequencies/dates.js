
export const computeTemporalGridPoints = (xmin, xmax, pxAvailable) => {
  const [majorGridPoints, minorGridPoints] = [[], []];
  const {majorStep, minorStep} = calculateTemporalGridSeperation(xmax-xmin, Math.abs(pxAvailable));

  /* Major Grid Points */
  const overallStopDate = getNextDate(majorStep.unit, numericToDateObject(xmax));
  let proposedDate = getPreviousDate(majorStep.unit, numericToDateObject(xmin));
  while (proposedDate < overallStopDate) {
    majorGridPoints.push({
      date: proposedDate,
      position: calendarToNumeric(dateToString(proposedDate)),
      name: prettifyDate(majorStep.unit, proposedDate),
      visibility: 'visible',
      axis: "x"
    });
    for (let i=0; i<majorStep.n; i++) {
      proposedDate = getNextDate(majorStep.unit, proposedDate);
    }
  }


  return {majorGridPoints};
};

const calculateTemporalGridSeperation = (timeRange, pxAvailable) => {
  const [majorStep, minorStep] = [{unit: "DAY", n: 1}, {unit: "DAY", n: 0}];
  const minPxBetweenMajorGrid = (pxAvailable < 1000 ? 130 : 180);
  const timeBetweenMajorGrids = timeRange/(Math.floor(pxAvailable / minPxBetweenMajorGrid));
  const levels = {
    CENTURY: {t: 100, max: undefined},
    DECADE: {t: 10, max: 5}, // i.e. spacing of 50 years is ok, but 60 jumps up to 100y spacing
    FIVEYEAR: {t: 5, max: 1},
    YEAR: {t: 1, max: 3}, // 4 year spacing not allowed (will use 5 year instead)
    MONTH: {t: 1/12, max: 6}, // 7 month spacing not allowed
    WEEK: {t: 1/52, max: 1}, // 2 week spacing not allowed - prefer months
    DAY: {t: 1/365, max: 3}
  };
  const levelsKeys = Object.keys(levels);

  /* calculate the best unit of time to fit into the allowed range */
  majorStep.unit = "DAY"; // fallback value
  for (let i=0; i<levelsKeys.length-1; i++) {
    if (timeBetweenMajorGrids > levels[levelsKeys[i]].t) {
      majorStep.unit = levelsKeys[i];
      break;
    }
  }
  /* how many of those "units" should ideally fit into each major grid separation? */
  majorStep.n = Math.floor(timeBetweenMajorGrids/levels[majorStep.unit].t) || 1;
  /* if the numer of units (per major grid) is above the allowed max, use a bigger unit */
  if (levels[majorStep.unit].max && majorStep.n > levels[majorStep.unit].max) {
    majorStep.unit = levelsKeys[levelsKeys.indexOf(majorStep.unit)-1];
    majorStep.n = Math.floor(timeBetweenMajorGrids/levels[majorStep.unit].t) || 1;
  }

  /* Calculate best unit of time for the minor grid spacing */
  if (majorStep.n > 1 || majorStep.unit === "DAY") {
    minorStep.unit = majorStep.unit;
  } else {
    minorStep.unit = levelsKeys[levelsKeys.indexOf(majorStep.unit)+1];
  }
  /* how many of those "units" should form the separation of the minor grids? */
  const majorSpacing = majorStep.n * levels[majorStep.unit].t;
  minorStep.n = Math.ceil(levels[minorStep.unit].t/majorSpacing);

  return {majorStep, minorStep};
};


/**
 * Returns a `Date` object one `unit` in the future of the provided `date`
 */
const getNextDate = (unit, date) => {
  const dateClone = new Date(date.getTime());
  switch (unit) {
    case "DAY":
      dateClone.setDate(date.getDate() + 1);
      break;
    case "WEEK":
      dateClone.setDate(date.getDate() + 7);
      break;
    case "MONTH":
      dateClone.setMonth(date.getMonth() + 1);
      break;
    case "YEAR":
      dateClone.setFullYear(date.getFullYear() + 1);
      break;
    case "FIVEYEAR":
      dateClone.setFullYear(date.getFullYear() + 5);
      break;
    case "DECADE":
      dateClone.setFullYear(date.getFullYear() + 10);
      break;
    case "CENTURY":
      dateClone.setFullYear(date.getFullYear() + 100);
      break;
    default:
      console.error("Unknown unit for `getNextDate`:", unit);
  }
  return dateClone;
};

const getPreviousDate = (unit, date) => {
  const dateClone = new Date(date.getTime());
  const jan1st = date.getDate()===1 && date.getMonth()===0;
  switch (unit) {
    case "DAY":
      return dateClone;
    case "WEEK":
      const dayIdx = date.getDay(); // 0 is sunday
      if (dayIdx===1) return dateClone;
      dateClone.setDate(date.getDate() + (8-dayIdx)%7 - 7);
      return dateClone;
    case "MONTH":
      if (date.getDate()===1) return dateClone; // i.e. 1st of the month
      return new Date(date.getFullYear(), date.getMonth(), 1, 12);
    case "YEAR":
      if (jan1st) return dateClone;
      return new Date(date.getFullYear(), 0, 1, 12);
    case "FIVEYEAR": // fallsthrough
    case "DECADE":
      // decades start at "nice" numbers - i.e. multiples of 5 -- e.g. 2014 -> 2010, 2021 -> 2020
      return new Date(Math.floor((date.getFullYear())/5)*5, 0, 1, 12);
    case "CENTURY":
      return new Date(Math.floor((date.getFullYear())/100)*100, 0, 1, 12);
    default:
      console.error("Unknown unit for `advanceDateTo`:", unit);
      return dateClone;
  }
};

export const numericToDateObject = (numDate) => {
  /* Beware: for `Date`, months are 0-indexed, days are 1-indexed */
  const fracPart = numDate%1;
  const year = parseInt(numDate, 10);
  const nDaysInYear = isLeapYear(year) ? 366 : 365;
  const nDays = fracPart * nDaysInYear;
  const date = new Date((new Date(year, 0, 1)).getTime() + nDays*24*60*60*1000);
  return date;
};

function isLeapYear(year) {
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}

const calendarToNumeric = (calDate) => {
  if (calDate[0]==='-') {
    const pieces = calDate.substring(1).split('-');
    return -parseFloat(pieces[0]);
  }
  /* Beware: for `Date`, months are 0-indexed, days are 1-indexed */
  const [year, month, day] = calDate.split("-").map((n) => parseInt(n, 10));
  const oneDayInMs = 86400000; // 1000 * 60 * 60 * 24
  /* add on 1/2 day to let time represent noon (12h00) */
  const elapsedDaysInYear = (Date.UTC(year, month-1, day) - Date.UTC(year, 0, 1)) / oneDayInMs + 0.5;
  const fracPart = elapsedDaysInYear / (isLeapYear(year) ? 366 : 365);
  return year + fracPart;
};

const dateToString = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const prettifyDate = (unit, date) => {
  const stringDate = typeof date ==="number" ? numericToCalendar(date) :
    date instanceof Date ? dateToString(date) :
      date;
  const [year, month, day] = stringDate.split("-");
  switch (unit) {
    case "CENTURY": // falls through
    case "DECADE": // falls through
    case "FIVEYEAR": // falls through
    case "YEAR":
      if (month==="01" && day==="01") return year;
      // falls through if not jan 1st
    case "MONTH":
      if (day==="01") return `${year}-${months[month]}`;
      // falls through if not 1st of month
    default:
      return `${year}-${months[month]}-${day}`;
  }
};

const months = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep'
};
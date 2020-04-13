// challenge 1
const normalizeDecimal = (decimal) => Math.trunc(decimal);

const normalizeTimeToElapse = (timeToElapse, periodType) => {
  let daysToElapse;
  switch (periodType) {
    case 'weeks':
      daysToElapse = (timeToElapse * 7);
      break;
    case 'months':
      daysToElapse = (timeToElapse * 30);
      break;
    default:
      daysToElapse = (timeToElapse);
      break;
  }
  return daysToElapse;
};

const currentlyInfected = (reportedCases, resBody) => {
  resBody.impact.currentlyInfected = reportedCases * 10;

  resBody.severeImpact.currentlyInfected = reportedCases * 50;

  return resBody;
};

const infectionsByRequestedTime = (timeToElapse, resBody) => {
  const factor = normalizeDecimal(timeToElapse / 3);

  resBody.impact.infectionsByRequestedTime = (
    resBody.impact.currentlyInfected * (2 ** factor)
  );

  resBody.severeImpact.infectionsByRequestedTime = (
    resBody.severeImpact.currentlyInfected * (2 ** factor)
  );

  return resBody;
};

// challenge 2
const severeCasesByRequestedTime = (resBody) => {
  resBody.impact.severeCasesByRequestedTime = normalizeDecimal(
    resBody.impact.infectionsByRequestedTime * 0.15
  );

  resBody.severeImpact.severeCasesByRequestedTime = normalizeDecimal(
    resBody.severeImpact.infectionsByRequestedTime * 0.15
  );

  return resBody;
};

const hospitalBedsByRequestedTime = (totalHospitalBeds, resBody) => {
  const bedAvailability = (totalHospitalBeds * 0.35);
  resBody.impact.hospitalBedsByRequestedTime = normalizeDecimal(
    bedAvailability - resBody.impact.severeCasesByRequestedTime
  );

  resBody.severeImpact.hospitalBedsByRequestedTime = normalizeDecimal(
    bedAvailability - resBody.severeImpact.infectionsByRequestedTime
  );

  return resBody;
};

const covid19ImpactEstimator = (data) => {
  const {
    periodType, timeToElapse, reportedCases, totalHospitalBeds
  } = data;

  const daysToElapse = normalizeTimeToElapse(timeToElapse, periodType);

  const resBody = {
    data,
    impact: {},
    severeImpact: {}
  };

  currentlyInfected(reportedCases, resBody);

  infectionsByRequestedTime(daysToElapse, resBody);

  severeCasesByRequestedTime(resBody);

  hospitalBedsByRequestedTime(totalHospitalBeds, resBody);

  return resBody;
};

console.log(covid19ImpactEstimator({
  region: {
    name: 'Africa',
    avgAge: 19.7,
    avgDailyIncomeInUSD: 5,
    avgDailyIncomePopulation: 0.71
  },
  periodType: 'days',
  timeToElapse: 58,
  reportedCases: 674,
  population: 66622705,
  totalHospitalBeds: 1380614
}));

export default covid19ImpactEstimator;

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
  resBody.impact.severeCasesByRequestedTime = (
    resBody.impact.infectionsByRequestedTime * 0.15
  );

  resBody.severeImpact.severeCasesByRequestedTime = (
    resBody.severeImpact.infectionsByRequestedTime * 0.15
  );

  return resBody;
};

const hospitalBedsByRequestedTime = (totalHospitalBeds, resBody) => {
  resBody.impact.hospitalBedsByRequestedTime = normalizeDecimal(
    (0.35 * totalHospitalBeds) - resBody.impact.severeCasesByRequestedTime
  );

  resBody.severeImpact.hospitalBedsByRequestedTime = normalizeDecimal(
    (0.35 * totalHospitalBeds) - resBody.severeImpact.severeCasesByRequestedTime
  );

  return resBody;
};

// Challenge 3
const casesForICUByRequestedTime = (resBody) => {
  resBody.impact.casesForICUByRequestedTime = normalizeDecimal(
    0.05 * resBody.impact.infectionsByRequestedTime
  );

  resBody.severeImpact.casesForICUByRequestedTime = normalizeDecimal(
    0.05 * resBody.severeImpact.infectionsByRequestedTime
  );

  return resBody;
};

const casesForVentilatorsByRequestedTime = (resBody) => {
  resBody.impact.casesForVentilatorsByRequestedTime = normalizeDecimal(
    0.02 * resBody.impact.infectionsByRequestedTime
  );

  resBody.severeImpact.casesForVentilatorsByRequestedTime = normalizeDecimal(
    0.02 * resBody.severeImpact.infectionsByRequestedTime
  );

  return resBody;
};

const dollarsInFlight = (timeToElapse, avgDailyIncomePopulation, avgDailyIncomeInUSD, resBody) => {
  const factor = (avgDailyIncomePopulation * avgDailyIncomeInUSD) / timeToElapse;

  resBody.impact.dollarsInFlight = normalizeDecimal(
    resBody.impact.infectionsByRequestedTime * factor
  );

  resBody.severeImpact.dollarsInFlight = normalizeDecimal(
    resBody.severeImpact.infectionsByRequestedTime * factor
  );
};

// Main function
const covid19ImpactEstimator = (data) => {
  const {
    region, periodType, timeToElapse, reportedCases, totalHospitalBeds
  } = data;

  const {
    avgDailyIncomeInUSD, avgDailyIncomePopulation
  } = region;

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
  casesForICUByRequestedTime(resBody);
  casesForVentilatorsByRequestedTime(resBody);
  dollarsInFlight(daysToElapse, avgDailyIncomePopulation, avgDailyIncomeInUSD, resBody);

  return resBody;
};

module.exports = covid19ImpactEstimator;

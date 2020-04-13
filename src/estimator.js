// challenge 1
const normalizeDecimal = (decimal) => Math.trunc(decimal);

const normalizeTimeToElapse = (timeToElapse, periodType) => {
  switch (periodType) {
    case 'weeks':
      return (timeToElapse * 7);
    case 'months':
      return (timeToElapse * 30);
    default:
      return (timeToElapse);
  }
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
  resBody.impact.hospitalBedsByRequestedTime = normalizeDecimal(
    0.65 * (totalHospitalBeds - resBody.impact.severeCasesByRequestedTime)
  );

  resBody.severeImpact.hospitalBedsByRequestedTime = normalizeDecimal(
    0.65 * (totalHospitalBeds - resBody.severeImpact.infectionsByRequestedTime)
  );

  return resBody;
};

const covid19ImpactEstimator = (data) => {
  const {
    periodType, reportedCases, totalHospitalBeds
  } = data;

  let { timeToElapse } = data;

  timeToElapse = normalizeTimeToElapse(timeToElapse, periodType);

  const resBody = {
    data,
    impact: {},
    severeImpact: {}
  };

  currentlyInfected(reportedCases, resBody);

  infectionsByRequestedTime(timeToElapse, resBody);

  severeCasesByRequestedTime(resBody);

  hospitalBedsByRequestedTime(totalHospitalBeds, resBody);

  return resBody;
};

export default covid19ImpactEstimator;

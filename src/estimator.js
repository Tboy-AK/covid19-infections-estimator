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

const severeCasesByRequestedTimeincode = (resBody, inCodeBody) => {
  inCodeBody.impact.severeCasesByRequestedTime = (
    resBody.impact.infectionsByRequestedTime * 0.15
  );

  inCodeBody.severeImpact.severeCasesByRequestedTime = (
    resBody.severeImpact.infectionsByRequestedTime * 0.15
  );

  return inCodeBody;
};

const hospitalBedsByRequestedTime = (totalHospitalBeds, resBody, inCodeBody) => {
  const bedAvailability = (totalHospitalBeds * 1);
  resBody.impact.hospitalBedsByRequestedTime = normalizeDecimal(
    bedAvailability - inCodeBody.impact.severeCasesByRequestedTime
  );

  resBody.severeImpact.hospitalBedsByRequestedTime = normalizeDecimal(
    bedAvailability - inCodeBody.severeImpact.severeCasesByRequestedTime
  );

  return resBody;
};

const hospitalBedsByRequestedTimeincode = (totalHospitalBeds, inCodeBody) => {
  const bedAvailability = (totalHospitalBeds * 1);
  inCodeBody.impact.hospitalBedsByRequestedTime = (
    bedAvailability - inCodeBody.impact.severeCasesByRequestedTime
  );

  inCodeBody.severeImpact.hospitalBedsByRequestedTime = (
    bedAvailability - inCodeBody.severeImpact.severeCasesByRequestedTime
  );

  return inCodeBody;
};

const covid19ImpactEstimator = (data) => {
  const inCodeBody = {
    impact: {},
    severeImpact: {}
  };

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

  severeCasesByRequestedTimeincode(resBody, inCodeBody);

  hospitalBedsByRequestedTime(totalHospitalBeds, resBody, inCodeBody);

  hospitalBedsByRequestedTimeincode(totalHospitalBeds, inCodeBody);

  return resBody;
};

export default covid19ImpactEstimator;

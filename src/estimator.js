const normalizeDecimal = (decimal) => Math.floor(decimal);

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
  const bedAvailability = normalizeDecimal(totalHospitalBeds * 0.35);
  resBody.impact.hospitalBedsByRequestedTime = (
    bedAvailability - resBody.impact.severeCasesByRequestedTime
  );

  resBody.severeImpact.hospitalBedsByRequestedTime = (
    bedAvailability - resBody.severeImpact.infectionsByRequestedTime
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
    data, // the input data you got
    impact: {}, // your best case estimation
    severeImpact: {} // your severe case estimation
  };

  currentlyInfected(reportedCases, resBody);

  infectionsByRequestedTime(timeToElapse, resBody);

  severeCasesByRequestedTime(resBody);

  hospitalBedsByRequestedTime(totalHospitalBeds, resBody);

  return resBody;
};

export default covid19ImpactEstimator;

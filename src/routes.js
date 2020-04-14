const express = require('express');
const cors = require('cors');
const xmljs = require('xml-js');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const estimator = require('./estimator');

dotenv.config();

const router = express.Router();
const server = express();

server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(cookieParser());

router.post('/', (req, res) => {
  /* const {
    name,
    avgAge,
    avgDailyIncomeInUSD,
    avgDailyIncomePopulation,
    periodType,
    timeToElapse,
    reportedCases,
    population,
    totalHospitalBeds
  } = req.body;

  const region = {
    name,
    avgAge,
    avgDailyIncomeInUSD,
    avgDailyIncomePopulation
  };

  const inputData = {
    region,
    periodType,
    timeToElapse,
    reportedCases,
    population,
    totalHospitalBeds
  }; */

  const outputData = estimator(req.body);

  const jsonCookieOptions = {
    path: '/api/v1/on-covid-19/json',
    domain: `.${process.env.DOMAIN_NAME}`,
    httpOnly: true
  };

  const xmlCookieOptions = {
    path: '/api/v1/on-covid-19/xml',
    domain: `.${process.env.DOMAIN_NAME}`,
    httpOnly: true
  };

  if (process.env.DOMAIN_NAME !== 'herokuapp.com') {
    delete jsonCookieOptions.domain;
    delete xmlCookieOptions.domain;
  }

  res
    .cookie('estimate-data-json', JSON.stringify(outputData), jsonCookieOptions)
    .cookie('estimate-data-xml', JSON.stringify(outputData), xmlCookieOptions)
    .send(outputData);
});

// JSON route
router.get('/json', (req, res) => {
  res
    .status(200)
    .send(JSON.stringify(req.cookies['estimate-data']));
});

// XML route
router.get('/xml', (req, res) => {
  res
    .status(200)
    .send(xmljs.xml2json(JSON.stringify(req.cookies['estimate-data']),
      { compact: true, ignoreComment: true, spaces: 4 }));
});

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Set-Cookie');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  next();
});

server.use('/api/v1/on-covid-19', router);

module.exports = server;

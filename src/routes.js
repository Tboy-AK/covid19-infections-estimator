const express = require('express');
const cors = require('cors');
const xmljs = require('xml-js');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const estimator = require('./estimator');

dotenv.config();

const router = express.Router();
const app = express();

// Save access log to file
const logStream = fs.createWriteStream(path.join(__dirname, '../db/access.log'), { flags: 'a' });

app.use(morgan((tokens, req, res) => `${[
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  `${tokens['response-time'](req, res)}ms`
].join('    ')}\n`, { stream: logStream }));

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Main route
router.post('/', (req, res) => {
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

  const logCookieOptions = {
    path: '/api/v1/on-covid-19/logs',
    domain: `.${process.env.DOMAIN_NAME}`,
    httpOnly: true
  };

  if (process.env.DOMAIN_NAME !== 'herokuapp.com') {
    delete jsonCookieOptions.domain;
    delete xmlCookieOptions.domain;
    delete logCookieOptions.domain;
  }

  const reqLog = fs.readFileSync(path.join(__dirname, '../db/access.log'), { encoding: 'utf8' });

  res
    .cookie('estimate-data-json', JSON.stringify(outputData), jsonCookieOptions)
    .cookie('estimate-data-xml', JSON.stringify(outputData), xmlCookieOptions)
    .cookie('estimate-data-logs', reqLog, logCookieOptions)
    .send(outputData);
});

// JSON route
router.get('/json', (req, res) => {
  res
    .status(200)
    .send(JSON.stringify(req.cookies['estimate-data-json']));
});

// XML route
router.get('/xml', (req, res) => {
  res
    .status(200)
    .send(xmljs.xml2json(JSON.stringify(req.cookies['estimate-data-xml']),
      { compact: true, ignoreComment: true, spaces: 4 }));
});

// logs route
router.get('/logs', (req, res) => {
  res
    .status(200)
    .send(req.cookies['estimate-data-logs']);
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Set-Cookie');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  next();
});

app.use('/api/v1/on-covid-19', router);

module.exports = app;

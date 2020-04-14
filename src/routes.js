const express = require('express');
const cors = require('cors');
const xmljs = require('xml-js');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const estimator = require('./estimator');
const pool = require('../db/dbConfig');

// Initiate environment variable
dotenv.config();

// Initiate Express
const router = express.Router();
const app = express();

// Initiate request time before app use is initiated
const reqTime = Date.now();

// Run through Express app requirements
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Main route
app.use(router.post('/', async (req, res) => {
  const outputData = estimator(req.body);

  // Set cookie options
  const jsonCookieOptions = {
    path: '/json',
    domain: `.${process.env.DOMAIN_NAME}`,
    httpOnly: true
  };

  const xmlCookieOptions = {
    path: '/xml',
    domain: `.${process.env.DOMAIN_NAME}`,
    httpOnly: true
  };

  if (process.env.DOMAIN_NAME !== 'herokuapp.com') {
    delete jsonCookieOptions.domain;
    delete xmlCookieOptions.domain;
  }

  const { statusCode } = res;

  // When all response has been sent
  res.on('finish', () => {
    const { method, url } = req;
    const resTime = (Date.now() - reqTime) / 1000;

    pool.query('INSERT INTO request_logs(log_stream) VALUES($1)',
      [`${method}   /api/v1/on-covid-19${url}    ${statusCode}    ${resTime}ms`]);
  });

  res
    .cookie('estimate-data-json', JSON.stringify(outputData), jsonCookieOptions)
    .cookie('estimate-data-xml', JSON.stringify(outputData), xmlCookieOptions)
    .send(outputData);
}));

// JSON route
router.get('/json', (req, res) => {
  res
    .status(200)
    .send(JSON.parse(req.cookies['estimate-data-json']));
});

// XML route
router.get('/xml', (req, res) => {
  res
    .status(200)
    .send(xmljs.json2xml(JSON.parse(req.cookies['estimate-data-xml']),
      { compact: true, ignoreComment: true, spaces: 4 }));
});

// Logs route
router.get('/logs', (req, res) => pool.query('SELECT log_stream FROM request_logs')
  .then((result) => res
    .status(200)
    .send(result.rows.map((e) => e.log_stream).join('\n')))
  .catch(() => null));

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

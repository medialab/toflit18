/**
 * TOFLIT18 Express Application
 * =============================
 *
 * Simple express application serving the data of the TOFLIT18 project.
 */
import express from 'express';
import {api as config} from '../config.json';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import responses from './responses';

/**
 * Initialization.
 */
const ENV = process.env.NODE_ENV || 'dev';
responses(express);

/**
 * Configuring the application.
 */
const app = express();

// Cross-origin support
app.use(cors({
  credentials: true,
  origin: function(origin, next) {
    return next(null, !!~config.allowedOrigins.indexOf(origin));
  }
}));

// Simple log
app.use(morgan('dev'));

// Session options
const sessionOptions = {
  name: 'toflit18.sid',
  secret: config.secret,
  trustProxy: false,
  resave: true,
  saveUninitialized: true
};

// Utilities
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(session(sessionOptions));

/**
 * Routing.
 */
app.get('/hey', (_, res) => res.json({hey: 'ho'}));

/**
 * Exporting.
 */
export default app;

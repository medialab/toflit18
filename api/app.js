/**
 * TOFLIT18 Express Application
 * =============================
 *
 * Simple express application serving the data of the TOFLIT18 project.
 */
import express from 'express';
import wrap from 'dolman';
import path from 'path';
import {api as config} from '../config.json';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compress from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import createFileStore from 'session-file-store';
import {authenticate} from './middlewares';
import responses from './responses';

import classificationController from './controllers/classification';
import dataController from './controllers/data';
import loginController from './controllers/login';
import vizController from './controllers/viz';

const FileStore = createFileStore(session),
      dolman = wrap(express);

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

// If dev, we would like to store sessions for convenience
if (ENV === 'dev')
  sessionOptions.store = new FileStore({
    path: path.join(__dirname, '/../.output/sessions')
  });

// Utilities
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(compress());

/**
 * Routing & Mounting.
 */

// Creating routers from controllers
const loginRouter = dolman.router(loginController),
      dataRouter = dolman.router(dataController),
      classificationRouter = dolman.router(classificationController),
      vizRouter = dolman.router(vizController);

// Mounting
app.use(loginRouter);
app.use(authenticate, dataRouter);
app.use('/classification', authenticate, classificationRouter);
app.use('/viz', authenticate, vizRouter);
app.use((_, res) => res.notFound());

/**
 * Exporting.
 */
export default app;

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
import compress from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import createFileStore from 'session-file-store';
import middlewares from './middlewares';
import responses from './responses';

import classificationController from './controllers/classification';
import dataController from './controllers/data';
import loginController from './controllers/login';
import vizController from './controllers/viz';

const env = process.env.NODE_ENV || 'development';

const FileStore = createFileStore(session);

/**
 * Helpers.
 */
function createRouter(routes, auth, additionalMiddlewares) {
  const router = express.Router();

  routes.forEach(function(route) {
    const args = [route.url];

    if (auth)
      args.push(auth);

    if (route.validate)
      args.push(middlewares.validate(route.validate));

    if (additionalMiddlewares)
      additionalMiddlewares.forEach(m => args.push(m));

    args.push(route.action);

    (route.methods || ['GET'])
      .forEach(m => router[m.toLowerCase()].apply(router, args));
  });

  return router;
}

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
if (env === 'development')
  sessionOptions.store = new FileStore({
    path: __dirname + '/../.output/sessions'
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
const loginRouter = createRouter(loginController),
      dataRouter = createRouter(dataController, middlewares.authenticate),
      classificationRouter = createRouter(classificationController, middlewares.authenticate),
      vizRouter = createRouter(vizController, middlewares.authenticate);

// Mounting
app.use(loginRouter);
app.use(dataRouter);
app.use('/classification', classificationRouter);
app.use('/viz', vizRouter);
app.use((_, res) => res.notFound());

/**
 * Exporting.
 */
export default app;

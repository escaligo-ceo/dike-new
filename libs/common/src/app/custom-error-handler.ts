import { HttpStatus } from '@nestjs/common';
import { AppLogger } from './logger.js';
import { GenericError } from "./types.js";

export const customErrorHandler = (logger: AppLogger, err, req, res, next) => {
  if (err instanceof GenericError) {
    return res.status(HttpStatus.NOT_FOUND).send(err.message);
  }
  if (err instanceof GenericError) {
    return res.status(HttpStatus.FORBIDDEN).send(err.message);
  }
  const returnStatus = err.output ? err.output.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
  if (err >= HttpStatus.INTERNAL_SERVER_ERROR) {
    const message = `Caught unhandled error ${returnStatus} in request ${req.url}`;
    if (logger === undefined) {
      console.error(message, err);
    } else {
      logger.error(message, err);
    }
  }
  return res.status(returnStatus).json(err.output ? err.output.payload : err);
};

export const createCustomErrorHandler = (logger?: AppLogger) => {
  return (err, req, res, next) => {
    if (err instanceof GenericError) {
      return res.status(HttpStatus.NOT_FOUND).send(err.message);
    }
    if (err instanceof GenericError) {
      return res.status(HttpStatus.FORBIDDEN).send(err.message);
    }
    const returnStatus = err.output ? err.output.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    if (err >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const message = `Caught unhandled error ${returnStatus} in request ${req.url}`;
      if (logger === undefined) {
        console.error(message, err);
      } else {
        logger.error(message, err);
      }
    }
    return res.status(returnStatus).json(err.output ? err.output.payload : err);
  };
};

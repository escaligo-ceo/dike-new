import { AxiosError } from "axios";
import { AppLogger } from "../app/logger.js";
import { inspect } from "../app/utils.js";
import {
  HttpConnectionException,
  HttpServiceException,
  HttpTimeoutException,
} from "../exceptions/http.exception.js";

export class HttpErrorHandler {
  constructor(private readonly logger: AppLogger) {
    this.logger = new AppLogger(HttpErrorHandler.name);
  }

  handleError(
    logger: AppLogger,
    error: any,
    method: string,
    url: string
  ): never {
    // Log dell'errore completo per debugging (solo in development/staging)
    if (process.env.NODE_ENV !== "production") {
      this.logger.error(
        `Full HTTP Error Details: ${inspect({
          method,
          url,
          error: error.message,
          stack: error.stack,
          response: error.response?.data,
          status: error.response?.status,
          statusCide: error.response?.status,
        })}`
      );
    }

    // Determina il tipo di errore e crea l'eccezione appropriata
    if (this.isAxiosError(error)) {
      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        throw new HttpConnectionException("?", url, error);
      }

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        const timeout = error.config?.timeout || 5000;
        throw new HttpTimeoutException("?", method, url, timeout, error);
      }

      throw HttpServiceException.fromAxiosError(error, "?");
    }

    // Errore generico
    throw HttpServiceException.fromGenericError(error, "?", method, url);
  }

  private isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError === true;
  }

  // Helper per loggare solo informazioni essenziali in produzione
  logEssentialError(
    method: string,
    url: string,
    status?: number,
    message?: string
  ): void {
    const logData = {
      service: "?",
      method,
      url,
      status,
      message,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(`HTTP Error in ${this.logger}:`, logData);
  }
}

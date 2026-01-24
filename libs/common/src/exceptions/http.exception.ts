import { HttpException, HttpStatus } from "@nestjs/common";
import { AxiosError } from "axios";

export interface IHttpErrorDetails {
  service: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  message: string;
  data?: any;
}

export class HttpServiceException extends HttpException {
  public readonly details: IHttpErrorDetails;

  constructor(details: IHttpErrorDetails, cause?: Error) {
    const message = `HTTP Error in ${details.service}: ${details.method} ${details.url} - ${details.message}`;
    const status = details.status || HttpStatus.INTERNAL_SERVER_ERROR;

    super(
      {
        message,
        details: {
          service: details.service,
          method: details.method,
          url: details.url,
          status: details.status,
          statusText: details.statusText,
          originalMessage: details.message,
        },
        timestamp: new Date().toISOString(),
      },
      status
    );

    this.details = details;
    this.name = "HttpServiceException";

    if (cause) {
      this.cause = cause;
    }
  }

  static fromAxiosError(
    error: AxiosError,
    serviceName: string
  ): HttpServiceException {
    const method = error.config?.method?.toUpperCase() || "UNKNOWN";
    const url = error.config?.url || "unknown";

    const details: IHttpErrorDetails = {
      service: serviceName,
      method,
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    };

    return new HttpServiceException(details, error);
  }

  static fromGenericError(
    error: Error,
    serviceName: string,
    method: string,
    url: string
  ): void {
    const details: IHttpErrorDetails = {
      service: serviceName,
      method,
      url,
      message: error.message,
    };

    // return new HttpServiceException(details, error);
  }
}

export class HttpConnectionException extends HttpServiceException {
  constructor(serviceName: string, baseUrl: string, cause?: Error) {
    const details: IHttpErrorDetails = {
      service: serviceName,
      method: "CONNECTION",
      url: baseUrl,
      message: `Unable to connect to ${serviceName} at ${baseUrl}`,
    };

    super(details, cause);
    this.name = "HttpConnectionException";
  }
}

export class HttpTimeoutException extends HttpServiceException {
  constructor(
    serviceName: string,
    method: string,
    url: string,
    timeout: number,
    cause?: Error
  ) {
    const details: IHttpErrorDetails = {
      service: serviceName,
      method,
      url,
      status: HttpStatus.REQUEST_TIMEOUT,
      message: `Request timeout after ${timeout}ms`,
    };

    super(details, cause);
    this.name = "HttpTimeoutException";
  }
}

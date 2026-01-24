import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { AppLogger } from "../app/logger.js";
import { inspect } from "../app/utils.js";
import { HttpServiceException } from "../exceptions/http.exception.js";

@Catch(HttpServiceException)
export class HttpServiceExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger = new AppLogger(HttpServiceExceptionFilter.name);
  }

  catch(exception: HttpServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Log dell'errore per monitoraggio
    this.logger.error(
      `HTTP Service Exception: ${inspect({
        service: exception.details.service,
        method: exception.details.method,
        url: exception.details.url,
        status: exception.details.status,
        message: exception.details.message,
        timestamp: new Date().toISOString(),
      })}`
    );

    // Risposta pulita per il client
    const errorResponse = {
      statusCode: status,
      message: this.getClientMessage(exception),
      service: exception.details.service,
      timestamp: new Date().toISOString(),
      // Includi dati aggiuntivi solo se utili per il client
      ...(exception.details.data &&
        this.isClientSafeData(exception.details.data) && {
          details: exception.details.data,
        }),
    };

    response.status(status).json(errorResponse);
  }

  private getClientMessage(exception: HttpServiceException): string {
    // Personalizza i messaggi basandoti sul tipo di errore
    if (exception.name === "HttpConnectionException") {
      return `Service ${exception.details.service} is temporarily unavailable`;
    }

    if (exception.name === "HttpTimeoutException") {
      return `Service ${exception.details.service} response timeout`;
    }

    // Per errori HTTP con status specifici
    if (exception.details.status) {
      switch (exception.details.status) {
        case HttpStatus.NOT_FOUND:
          return "Requested resource not found";
        case HttpStatus.UNAUTHORIZED:
          return "Authentication required";
        case HttpStatus.FORBIDDEN:
          return "Access denied";
        case HttpStatus.BAD_REQUEST:
          return "Invalid request";
        case HttpStatus.INTERNAL_SERVER_ERROR:
          return "Internal service error";
        default:
          return `Service error (${exception.details.status})`;
      }
    }

    return "External service error";
  }

  private isClientSafeData(data: any): boolean {
    // Determina se i dati dell'errore sono sicuri da mostrare al client
    // Ad esempio, evita di mostrare stack traces, configurazioni, ecc.
    if (typeof data !== "object" || data === null) {
      return false;
    }

    // Lista di campi sicuri da mostrare
    const safeFields = ["message", "code", "field", "validation"];
    return Object.keys(data).some((key) =>
      safeFields.includes(key.toLowerCase())
    );
  }
}

import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AppLogger extends Logger {
  constructor(context?: string) {
    context ? super(context) : super();
  }

  private yellow(text: string): string {
    return `\x1b[33m${text}\x1b[0m`;
  }

  log(message: string, ...optionalParams: any[]) {
    super.log(
      // `${this.yellow(`[${this.context}]`)} ${message}`,
      message,
      ...optionalParams
    );
  }

  error(message: string, ...optionalParams: any[]) {
    super.error(
      // `${this.yellow(`[${this.context}]`)} ${message}`,
      message,
      ...optionalParams
    );
  }

  warn(message: string, ...optionalParams: any[]) {
    super.warn(
      // `${this.yellow(`[${this.context}]`)} ${message}`,
      message,
      ...optionalParams
    );
  }

  debug(message: string, ...optionalParams: any[]) {
    super.debug(
      // `${this.yellow(`[${this.context}]`)} ${message}`,
      message,
      ...optionalParams
    );
  }

  verbose(message: string, ...optionalParams: any[]) {
    super.verbose(
      // `${this.yellow(`[${this.context}]`)} ${message}`,
      message,
      ...optionalParams
    );
  }

  fatal(message: string, ...optionalParams: any[]): void {
    super.error(
      // `${this.yellow(`[${this.context}]`)} ${message}`,
      message,
      ...optionalParams
    );
    // process.exit(1); // FIXME: decide if we want to exit on fatal
  }
}

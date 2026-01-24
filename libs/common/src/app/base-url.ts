import { Client } from "pg";
import { getDefaultPort } from "../db/create-database.js";
import { DbConnectionType } from "../db/db.enum.js";
import { AppLogger } from "./logger.js";
import { inspect } from "./utils.js";

interface IParamString {
  readonly logger: AppLogger;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export class BaseUrl implements IParamString {
  logger: AppLogger;
  protocol?: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  path?: string;

  constructor(value: string) {
    this.logger = new AppLogger(BaseUrl.name);
    this.parseBaseUrl(value);
  }

  private parseBaseUrl(value: string): any {
    if (!value) {
      throw new Error(`BaseUrl is empty or undefined`);
    }
    const regex =
      /^(?<protocol>[^:]+):\/\/(?:(?<username>[^:]+)(?::(?<password>[^@]*))?@)?(?<host>[^:/?#]+)(?::(?<port>\d+))?(?:\/(?<path>[^?#]*))?/;
    const match = value.match(regex);

    if (!match || !match.groups) {
      throw new Error(`Invalid base url value: ${value}`);
    }

    const { protocol, username, password, host, port, path } = match.groups as {
      [key: string]: string;
    };

    const resp = {
      protocol,
      host,
      port: port ? Number(port) : getDefaultPort(protocol),
      username: username || undefined,
      password: password || undefined,
      path: path || undefined,
    };
    this.protocol = resp.protocol;
    this.host = resp.host;
    this.port = resp.port;
    this.username = resp.username;
    this.password = resp.password;
    this.path = resp.path;

    return resp;
  }

  parse(): any {
    return this.parseBaseUrl(
      `${this.protocol}://${this.host}:${this.port}${
        this.path ? `/${this.path}` : ""
      }`
    );
  }

  baseUrl(): string {
    const safePort = this.port || (this.protocol === "https" ? "443" : "80");
    return `${this.protocol}://${this.host}:${safePort}${
      this.path ? `/${this.path}` : ""
    }`;
  }
}

export class DbConnection implements IParamString {
  logger: AppLogger;
  dialect: DbConnectionType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  dbName: string;

  constructor(value: string) {
    this.logger = new AppLogger(DbConnection.name);
    this.parseConnectionStr(value);
    this.logger.log(
      `Initialized DbConnection for ${this.dialect} at ${this.host}:${this.port}/${this.dbName}`
    );
  }

  parse(): any {
    return this.parseConnectionStr(
      `${this.dialect}://${this.username}:${this.password}@${this.host}:${this.port}/${this.dbName}`
    );
  }

  parseConnectionStr(connectionStr: string): any {
    if (!connectionStr) {
      throw new Error(`connectionStr is empty or undefined`);
    }

    const regex =
      /^(?<dialect>[^:]+):\/\/(?<username>[^:]+):(?<password>[^@]+)@(?<host>[^:/]+):(?<port>\d+)\/(?<dbName>[^/?#]+)$/;
    const match = connectionStr.match(regex);

    if (!match || !match.groups) {
      throw new Error(`Invalid connection string format: ${connectionStr}`);
    }

    const { dialect, username, password, host, port, dbName } =
      match.groups as { [key: string]: string };

    const resp = {
      dialect: dialect as DbConnectionType,
      username,
      password,
      host,
      port: Number(port),
      dbName,
    };
    this.logger.debug(
      `Parsed connection string: ${inspect({ dialect, username, password, host, port, dbName })}`
    );

    this.dialect = resp.dialect;
    this.host = resp.host;
    this.port = resp.port;
    this.username = resp.username;
    this.password = resp.password;
    this.dbName = resp.dbName;

    return resp;
  }

  connectionStr(): string {
    return `${this.dialect}://${this.host}:${this.port}${
      this.dbName ? `/${this.dbName}` : ""
    }`;
  }

  getClient(): Client {
    return new Client({
      host: this.host,
      port: this.port || this.dialect === "postgres" ? 5432 : 3306,
      user: this.username,
      password: this.password,
      database:
        this.dbName || this.dialect === "postgres" ? "postgres" : "mysql",
    });
  }

  getDatasourceOptions() {
    return {
      type: this.dialect,
      host: this.host,
      port: this.port || (this.dialect === "postgres" ? 5432 : 3306),
      username: this.username,
      password: this.password,
      database:
        this.dbName || (this.dialect === "postgres" ? "postgres" : "mysql"),
    };
  }
}

// export interface IUrlParams {
//   protocol: string;
//   username?: string;
//   password?: string;
//   host: string;
//   port: number;
//   path?: string;
// }

// export interface IConnectionParams {
//   dialect: DbConnectionType;
//   username: string;
//   password: string;
//   host: string;
//   port: number;
//   dbName: string;
// }

export interface IDBConfigurations {
  postgresConnectionStr: string;
  serviceDbConnectionStr: string;
}

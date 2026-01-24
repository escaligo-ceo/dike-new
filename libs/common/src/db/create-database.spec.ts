import { BaseUrl, DbConnection } from "../app/base-url";
import { DbConnectionType } from "./db.enum";

describe('db.create-database', () => {
  describe('parseConnectionStr', () => {
    it('should parse a valid connection string', () => {
      const input = 'postgres://user:password@localhost:5432/mydb';
      const expected = {
        dialect: DbConnectionType.POSTGRES,
        host: 'localhost',
        port: 5432,
        username: 'user',
        password: 'password',
        dbName: 'mydb',
      };
      const result = new DbConnection(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });
  });

  describe('new BaseUrl', () => {

    it('should parse a valid base url', () => {
      const input = 'http://user:pwd@localhost:3000/path';
      const expected: BaseUrl = new BaseUrl(input);
      expected.protocol = 'http';
      expected.username = 'user';
      expected.password = 'pwd';
      expected.host = 'localhost';
      expected.port = 3000;
      expected.path = 'path';

      const result = new BaseUrl(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should parse a partial valid base url', () => {
      const input = 'http://localhost:3000/path';
      const expected = {
        protocol: 'http',
        username: undefined,
        password: undefined,
        host: 'localhost',
        port: 3000,
        path: 'path',
      };
      const result = new BaseUrl(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should parse a partial valid base url', () => {
      const input = 'http://localhost:3000';
      const expected = {
        protocol: 'http',
        username: undefined,
        password: undefined,
        host: 'localhost',
        port: 3000,
        path: undefined,
      };
      const result = new BaseUrl(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should parse a partial valid base url', () => {
      const input = 'http://localhost';
      const expected = {
        protocol: 'http',
        username: undefined,
        password: undefined,
        host: 'localhost',
        port: 80,
        path: undefined,
      };
      const result = new BaseUrl(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should parse a partial valid base url', () => {
      const input = 'https://localhost';
      const expected = {
        protocol: 'https',
        username: undefined,
        password: undefined,
        host: 'localhost',
        port: 443,
        path: undefined,
      };
      const result = new BaseUrl(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });
  });
});
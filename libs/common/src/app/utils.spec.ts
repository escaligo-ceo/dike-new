import { hideSensitiveData, inspect } from "./utils";

describe('app.utils', () => {
  describe('hideSensitiveData', () => {

    it('should hide sensitive data in an object', () => {
      const input = { username: 'user1', password: 'secret', email: 'examle@email.com' };
      const expected = { username: 'user1', password: '***', email: 'examle@email.com' };
      const result = hideSensitiveData(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('shouldn\'t hide anythigh', () => {
      const input = { a: 1, b: 'test', c: [1, 2, 3] };
      const expected = { a: 1, b: 'test', c: [1,2,3] };
      const result = hideSensitiveData(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });
  })

  describe('inspect', () => {

    it('should return a standard inspection result', () => {
      const input = { a: 1, b: 'test', c: [1, 2, 3] };
      const expected = "{ a: 1, b: 'test', c: [ 1, 2, 3 ] }";
      const result = inspect(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should return a standard inspection result, it doesn\' try to hide anythig', () => {
      const input = { a: 1, b: 'test', c: [1, 2, 3] };
      const expected = "{ a: 1, b: 'test', c: [ 1, 2, 3 ] }";
      const result = inspect(input, false);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should return an inspection result with sensible data hidded', () => {
      const input = { a: 1, password: 'test', c: [1, 2, 3] };
      const expected = "{ a: 1, password: '***', c: [ 1, 2, 3 ] }";
      const result = inspect(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should return a standard inspection result, it doesn\' try to hide anythig', () => {
      const input = { a: 1, password: 'test', c: [1, 2, 3] };
      const expected = "{ a: 1, password: 'test', c: [ 1, 2, 3 ] }";
      const result = inspect(input, false);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should return an inspection result with sensible data hidded, even if it is a string', () => {
      const input = { a: 1, password: 'test', c: [1, 2, 3] };
      const expected = "{ a: 1, password: '***', c: [ 1, 2, 3 ] }";
      const result = inspect(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should return as inspection result with sensible data hidded, even if it is a string in UrlSearchParams format', () => {
      const input = "a=1&password=secret&c=1,2,3";
      const expected = "a=1&password=***&c=1,2,3";
      const result = inspect(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });

    it('should return an inspection result with sensible data hidden, even if it is a string in UrlSearchParams format', () => {
      const input = {
        success: true,
        link: 'http://localhost:8000/register/user?email=testemail@doke.com&token=sensitive-data'
      };
      const expected = "{ success: true, link: http://localhost:8000/register/user?email=testemail@doke.com&token=*** }";
      const result = inspect(input);
      expect(result).toBeDefined();
      expect(result).toStrictEqual(expected);
    });
  });
});

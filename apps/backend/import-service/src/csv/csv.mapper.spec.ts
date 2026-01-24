import { CsvMapper } from "./csv.mapper";

describe("CsvMapper", () => {
  let csvMapper: CsvMapper;

  beforeEach(() => {
    csvMapper = new CsvMapper();
  });

  describe("mapRowToEntity - Simple fields", () => {
    it("should map simple fields correctly", () => {
      const row = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };
      const mapping = {
        firstName: "firstName",
        lastName: "lastName",
        email: "email",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
    });

    it("should skip missing columns", () => {
      const row = {
        firstName: "John",
        lastName: "Doe",
      };
      const mapping = {
        firstName: "firstName",
        lastName: "lastName",
        email: "email", // colonna mancante
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        lastName: "Doe",
      });
    });

    it("should skip empty values", () => {
      const row = {
        firstName: "John",
        lastName: "",
        email: null,
      };
      const mapping = {
        firstName: "firstName",
        lastName: "lastName",
        email: "email",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
      });
    });
  });

  describe("mapRowToEntity - Array notation", () => {
    it("should map single array element with multiple fields", () => {
      const row = {
        firstName: "John",
        "address[0].label": "Home",
        "address[0].street": "Main St 123",
        "address[0].city": "New York",
      };
      const mapping = {
        firstName: "firstName",
        "address[0].label": "addresses[0].label",
        "address[0].street": "addresses[0].street",
        "address[0].city": "addresses[0].city",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        addresses: [
          {
            label: "Home",
            street: "Main St 123",
            city: "New York",
          },
        ],
      });
    });

    it("should map multiple array elements", () => {
      const row = {
        firstName: "John",
        "address[0].label": "Home",
        "address[0].street": "Main St 123",
        "address[1].label": "Work",
        "address[1].street": "Office Ave 456",
      };
      const mapping = {
        firstName: "firstName",
        "address[0].label": "addresses[0].label",
        "address[0].street": "addresses[0].street",
        "address[1].label": "addresses[1].label",
        "address[1].street": "addresses[1].street",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        addresses: [
          { label: "Home", street: "Main St 123" },
          { label: "Work", street: "Office Ave 456" },
        ],
      });
    });

    it("should handle partial array elements", () => {
      const row = {
        firstName: "John",
        "address[0].label": "Home",
        "address[0].street": "Main St 123",
        "address[1].street": "Office Ave 456", // no label for address[1]
      };
      const mapping = {
        firstName: "firstName",
        "address[0].label": "addresses[0].label",
        "address[0].street": "addresses[0].street",
        "address[1].street": "addresses[1].street",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        addresses: [
          { label: "Home", street: "Main St 123" },
          { street: "Office Ave 456" },
        ],
      });
    });

    it("should handle gaps in array indices", () => {
      const row = {
        firstName: "John",
        "address[0].label": "Home",
        "address[2].label": "Other", // indice 2, salta 1
      };
      const mapping = {
        firstName: "firstName",
        "address[0].label": "addresses[0].label",
        "address[2].label": "addresses[2].label",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        addresses: [
          { label: "Home" },
          undefined, // slot vuoto
          { label: "Other" },
        ],
      });
    });

    it("should handle nested arrays with different entity types", () => {
      const row = {
        firstName: "John",
        "email[0].email": "john@home.com",
        "email[0].label": "personal",
        "phone[0].number": "+39-123-456",
      };
      const mapping = {
        firstName: "firstName",
        "email[0].email": "emails[0].email",
        "email[0].label": "emails[0].label",
        "phone[0].number": "phones[0].number",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        emails: [
          {
            email: "john@home.com",
            label: "personal",
          },
        ],
        phones: [
          {
            number: "+39-123-456",
          },
        ],
      });
    });
  });

  describe("mapRowToEntity - Nested object notation", () => {
    it("should map nested objects with dot notation", () => {
      const row = {
        "contact.firstName": "John",
        "contact.lastName": "Doe",
      };
      const mapping = {
        "contact.firstName": "contact.firstName",
        "contact.lastName": "contact.lastName",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        contact: {
          firstName: "John",
          lastName: "Doe",
        },
      });
    });
  });

  describe("mapCsv", () => {
    it("should map multiple rows", () => {
      const rows = [
        {
          firstName: "John",
          "address[0].label": "Home",
          "address[0].street": "Main St",
        },
        {
          firstName: "Jane",
          "address[0].label": "Work",
          "address[0].street": "Office Ave",
        },
      ];
      const mapping = {
        firstName: "firstName",
        "address[0].label": "addresses[0].label",
        "address[0].street": "addresses[0].street",
      };

      const result = csvMapper.mapCsv(rows, mapping);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        firstName: "John",
        addresses: [{ label: "Home", street: "Main St" }],
      });
      expect(result[1]).toEqual({
        firstName: "Jane",
        addresses: [{ label: "Work", street: "Office Ave" }],
      });
    });
  });

  describe("Complex scenarios", () => {
    it("should handle a complete contact import with all entity types", () => {
      const row = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        "phone[0].number": "+39-123-456",
        "phone[0].label": "mobile",
        "phone[1].number": "+39-654-321",
        "phone[1].label": "home",
        "address[0].street": "Main St 123",
        "address[0].city": "New York",
        "address[0].label": "Home",
        "company.name": "ACME Corp",
        "company.title": "Manager",
      };
      const mapping = {
        firstName: "firstName",
        lastName: "lastName",
        email: "email",
        "phone[0].number": "phones[0].number",
        "phone[0].label": "phones[0].label",
        "phone[1].number": "phones[1].number",
        "phone[1].label": "phones[1].label",
        "address[0].street": "addresses[0].street",
        "address[0].city": "addresses[0].city",
        "address[0].label": "addresses[0].label",
        "company.name": "company.name",
        "company.title": "company.title",
      };

      const result = csvMapper.mapRowToEntity(row, mapping);

      expect(result).toEqual({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phones: [
          { number: "+39-123-456", label: "mobile" },
          { number: "+39-654-321", label: "home" },
        ],
        addresses: [{ street: "Main St 123", city: "New York", label: "Home" }],
        company: {
          name: "ACME Corp",
          title: "Manager",
        },
      });
    });
  });
});

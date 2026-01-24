import {
  getByPath,
  isArrayPath,
  parseArrayPath,
  setByPath,
} from "./path.utils";

describe("Path Utils", () => {
  describe("getByPath", () => {
    it("should get simple property", () => {
      const obj = { firstName: "John" };
      expect(getByPath(obj, "firstName")).toBe("John");
    });

    it("should get nested property with dot notation", () => {
      const obj = { user: { name: "John" } };
      expect(getByPath(obj, "user.name")).toBe("John");
    });

    it("should get array element with bracket notation", () => {
      const obj = { addresses: [{ street: "Main St" }] };
      expect(getByPath(obj, "addresses[0].street")).toBe("Main St");
    });

    it("should return undefined for missing path", () => {
      const obj = { user: { name: "John" } };
      expect(getByPath(obj, "user.age")).toBeUndefined();
    });

    it("should return undefined for null object", () => {
      expect(getByPath(null, "any.path")).toBeUndefined();
    });

    it("should handle deeply nested paths", () => {
      const obj = {
        user: {
          address: {
            location: {
              city: "New York",
            },
          },
        },
      };
      expect(getByPath(obj, "user.address.location.city")).toBe("New York");
    });
  });

  describe("setByPath", () => {
    it("should set simple property", () => {
      const obj: any = {};
      setByPath(obj, "firstName", "John");
      expect(obj.firstName).toBe("John");
    });

    it("should set nested property with dot notation", () => {
      const obj: any = {};
      setByPath(obj, "user.name", "John");
      expect(obj.user.name).toBe("John");
    });

    it("should create intermediate objects", () => {
      const obj: any = {};
      setByPath(obj, "user.profile.age", 30);
      expect(obj.user.profile.age).toBe(30);
    });

    it("should set array element with bracket notation", () => {
      const obj: any = {};
      setByPath(obj, "addresses[0].street", "Main St");
      expect(obj.addresses).toEqual([{ street: "Main St" }]);
    });

    it("should set multiple array elements", () => {
      const obj: any = {};
      setByPath(obj, "addresses[0].street", "Main St");
      setByPath(obj, "addresses[1].street", "Second Ave");
      expect(obj.addresses).toEqual([
        { street: "Main St" },
        { street: "Second Ave" },
      ]);
    });

    it("should update existing values", () => {
      const obj = { user: { name: "John" } } as any;
      setByPath(obj, "user.name", "Jane");
      expect(obj.user.name).toBe("Jane");
    });

    it("should handle gaps in array indices", () => {
      const obj: any = {};
      setByPath(obj, "addresses[0].street", "Main St");
      setByPath(obj, "addresses[2].street", "Third Ave");
      expect(obj.addresses[0]).toEqual({ street: "Main St" });
      expect(obj.addresses[1]).toBeUndefined();
      expect(obj.addresses[2]).toEqual({ street: "Third Ave" });
    });

    it("should overwrite primitive values with array when needed", () => {
      const obj: any = { addresses: "old string value" };
      // When mapping to addresses[0].street, should overwrite the string with array
      setByPath(obj, "addresses[0].street", "Main St");
      expect(Array.isArray(obj.addresses)).toBe(true);
      expect(obj.addresses[0]).toEqual({ street: "Main St" });
    });

    it("should overwrite primitive values with object when needed", () => {
      const obj: any = { company: "" };
      // When mapping to company.name, should overwrite the string with object
      setByPath(obj, "company.name", "ACME Corp");
      expect(typeof obj.company).toBe("object");
      expect(obj.company.name).toBe("ACME Corp");
    });

    it("should handle mixed nested and array notation", () => {
      const obj: any = {};
      setByPath(obj, "contact.addresses[0].street", "Main St");
      expect(obj.contact.addresses[0].street).toBe("Main St");
    });
  });

  describe("parseArrayPath", () => {
    it("should parse simple array path", () => {
      const result = parseArrayPath("emails[0].email");
      expect(result).toEqual({
        arrayPath: "emails",
        index: 0,
        fieldPath: "email",
      });
    });

    it("should parse array path with multiple indices", () => {
      const result = parseArrayPath("addresses[2].street");
      expect(result).toEqual({
        arrayPath: "addresses",
        index: 2,
        fieldPath: "street",
      });
    });

    it("should parse nested field paths", () => {
      const result = parseArrayPath("contacts[0].address.street");
      expect(result).toEqual({
        arrayPath: "contacts",
        index: 0,
        fieldPath: "address.street",
      });
    });

    it("should return null for non-array paths", () => {
      expect(parseArrayPath("firstName")).toBeNull();
      expect(parseArrayPath("user.name")).toBeNull();
      expect(parseArrayPath("addresses.street")).toBeNull();
    });

    it("should return null for malformed array notation", () => {
      expect(parseArrayPath("emails[abc].email")).toBeNull();
      expect(parseArrayPath("emails[0]")).toBeNull();
      expect(parseArrayPath("[0].email")).toBeNull();
    });
  });

  describe("isArrayPath", () => {
    it("should return true for array paths", () => {
      expect(isArrayPath("emails[0].email")).toBe(true);
      expect(isArrayPath("addresses[1].street")).toBe(true);
      expect(isArrayPath("contacts[0].address.city")).toBe(true);
    });

    it("should return false for non-array paths", () => {
      expect(isArrayPath("firstName")).toBe(false);
      expect(isArrayPath("user.name")).toBe(false);
      expect(isArrayPath("addresses.street")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isArrayPath("test[0]")).toBe(true);
      expect(isArrayPath("[0]")).toBe(true);
      expect(isArrayPath("test[]")).toBe(false);
    });
  });

  describe("Integration scenarios", () => {
    it("should set and get complex nested structures", () => {
      const obj: any = {};

      // Set multiple values
      setByPath(obj, "firstName", "John");
      setByPath(obj, "addresses[0].street", "Main St");
      setByPath(obj, "addresses[0].city", "New York");
      setByPath(obj, "addresses[1].street", "Second Ave");
      setByPath(obj, "emails[0].email", "john@example.com");

      // Get values
      expect(getByPath(obj, "firstName")).toBe("John");
      expect(getByPath(obj, "addresses[0].street")).toBe("Main St");
      expect(getByPath(obj, "addresses[0].city")).toBe("New York");
      expect(getByPath(obj, "addresses[1].street")).toBe("Second Ave");
      expect(getByPath(obj, "emails[0].email")).toBe("john@example.com");
    });

    it("should handle real-world CSV import scenario", () => {
      const csvRow = {
        firstName: "John",
        lastName: "Doe",
        "phone[0].number": "+39-123-456",
        "phone[0].label": "mobile",
        "phone[1].number": "+39-654-321",
        "phone[1].label": "home",
        "address[0].street": "Main St 123",
        "address[0].city": "New York",
      };

      const entity: any = {};

      // Apply CSV mapping
      for (const [key, value] of Object.entries(csvRow)) {
        if (value && value !== "") {
          const entityPath = key
            .replace(/^([a-z]+)\[(\d+)\]\./, "phones[$2].")
            .replace(/^address/, "addresses");
          setByPath(entity, entityPath, value);
        }
      }

      // Verify structure
      expect(entity.firstName).toBe("John");
      expect(entity.lastName).toBe("Doe");
      expect(entity.phones).toHaveLength(2);
      expect(entity.phones[0].number).toBe("+39-123-456");
      expect(entity.addresses).toHaveLength(1);
      expect(entity.addresses[0].city).toBe("New York");
    });
  });
});

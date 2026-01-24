export const mockProfileRepository = {
  findOne: jest.fn((input) => {
    if (input === "test-user-id-2") {
      return {
        userId: input,
        name: "Test User",
        email: "test@example.com",
        phoneNumber: "1234567890",
        piva: "1234567890",
      };
    }
    return null;
  }),
  create: jest.fn((input) => {
    return { id: "new-id", ...input };
  }),
  save: jest.fn(),
  findByUserId: jest.fn((input) => {
    if (input === "test-user-id-3") {
      return {
        userId: input,
        name: "Test User",
        email: "test@example.com",
        phoneNumber: "1234567890",
        piva: "1234567890",
      };
    }
    return null;
  }),
};

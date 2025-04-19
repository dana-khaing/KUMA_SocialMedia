import { updateProfile } from "@/lib/action";
import { auth } from "@clerk/nextjs/server";
import prisma from "../lib/client";
import { z } from "zod";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// Mock Prisma client
jest.mock("../lib/client", () => ({
  user: {
    update: jest.fn(),
  },
}));

describe("Server Actions", () => {
  const userId = "user123";
  const validFormData = new FormData();
  validFormData.append("name", "John");
  validFormData.append("surname", "Doe");
  validFormData.append("dob", "1990-01-01");
  validFormData.append("bio", "Software developer");
  validFormData.append("city", "New York");
  validFormData.append("school", "NYU");
  validFormData.append("work", "Tech Corp");
  validFormData.append("website", "https://johndoe.com");

  const validCover = "https://example.com/cover.jpg";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ userId });
  });

  // updateProfile Tests
  describe("updateProfile", () => {
    it("updates user profile successfully with valid data", async () => {
      prisma.user.update.mockResolvedValue({});

      const result = await updateProfile(validFormData, validCover);

      expect(auth).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          cover: validCover,
          name: "John",
          surname: "Doe",
          dob: expect.any(Date), // Zod transforms to Date
          bio: "Software developer",
          city: "New York",
          school: "NYU",
          work: "Tech Corp",
          website: "https://johndoe.com",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("updates user profile with partial valid data", async () => {
      const partialFormData = new FormData();
      partialFormData.append("name", "Jane");
      partialFormData.append("bio", "Artist");
      partialFormData.append("city", ""); // Empty field, should be filtered out

      prisma.user.update.mockResolvedValue({});

      const result = await updateProfile(partialFormData, undefined);

      expect(auth).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: "Jane",
          bio: "Artist",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("throws error if user is not authenticated", async () => {
      auth.mockResolvedValue({ userId: null });

      await expect(updateProfile(validFormData, validCover)).rejects.toThrow(
        "User not authenticated"
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("throws error on invalid data (validation failure)", async () => {
      const invalidFormData = new FormData();
      invalidFormData.append("name", "TooLongName123"); // Exceeds max length
      invalidFormData.append("dob", "invalid-date"); // Invalid date format

      await expect(updateProfile(invalidFormData, validCover)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
      expect(auth).not.toHaveBeenCalled(); // Validation fails before auth
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("throws error on database failure", async () => {
      prisma.user.update.mockRejectedValue(new Error("DB Error"));

      await expect(updateProfile(validFormData, validCover)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
      expect(auth).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          cover: validCover,
          name: "John",
          surname: "Doe",
          dob: expect.any(Date),
          bio: "Software developer",
          city: "New York",
          school: "NYU",
          work: "Tech Corp",
          website: "https://johndoe.com",
        },
      });
    });

    it("filters out empty fields correctly", async () => {
      const formDataWithEmpty = new FormData();
      formDataWithEmpty.append("name", "John");
      formDataWithEmpty.append("surname", "");
      formDataWithEmpty.append("bio", ""); // Empty fields
      formDataWithEmpty.append("city", "New York");

      prisma.user.update.mockResolvedValue({});

      const result = await updateProfile(formDataWithEmpty, undefined);

      expect(auth).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: "John",
          city: "New York",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("handles missing cover field", async () => {
      prisma.user.update.mockResolvedValue({});

      const result = await updateProfile(validFormData, undefined);

      expect(auth).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: "John",
          surname: "Doe",
          dob: expect.any(Date),
          bio: "Software developer",
          city: "New York",
          school: "NYU",
          work: "Tech Corp",
          website: "https://johndoe.com",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("throws error on invalid date format", async () => {
      const invalidFormData = new FormData();
      invalidFormData.append("name", "John");
      invalidFormData.append("dob", "2023-13-01"); // Invalid month

      await expect(updateProfile(invalidFormData, validCover)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
      expect(auth).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});

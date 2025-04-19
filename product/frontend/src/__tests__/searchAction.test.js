import { searchAction } from "@/lib/action";
import prisma from "../lib/client";

// Mock Prisma client
jest.mock("../lib/client", () => ({
  user: {
    findMany: jest.fn(),
  },
}));

describe("Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // searchAction Tests
  describe("searchAction", () => {
    it("returns users matching the query by name", async () => {
      const query = "john";
      const mockUsers = [
        {
          id: "user1",
          name: "John Doe",
          surname: "Doe",
          username: "johndoe",
          avatar: "/avatar1.png",
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await searchAction(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: query.toLowerCase() } },
            { surname: { contains: query.toLowerCase() } },
            { username: { contains: query.toLowerCase() } },
          ],
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("returns users matching the query by surname", async () => {
      const query = "Smith";
      const mockUsers = [
        {
          id: "user2",
          name: "Jane Smith",
          surname: "Smith",
          username: "janesmith",
          avatar: "/avatar2.png",
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await searchAction(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: query.toLowerCase() } },
            { surname: { contains: query.toLowerCase() } },
            { username: { contains: query.toLowerCase() } },
          ],
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("returns users matching the query by username", async () => {
      const query = "kuma";
      const mockUsers = [
        {
          id: "user3",
          name: "Kuma User",
          surname: "User",
          username: "kuma123",
          avatar: "/avatar3.png",
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await searchAction(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: query.toLowerCase() } },
            { surname: { contains: query.toLowerCase() } },
            { username: { contains: query.toLowerCase() } },
          ],
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("returns empty array when no users match the query", async () => {
      const query = "nonexistent";
      prisma.user.findMany.mockResolvedValue([]);

      const result = await searchAction(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: query.toLowerCase() } },
            { surname: { contains: query.toLowerCase() } },
            { username: { contains: query.toLowerCase() } },
          ],
        },
      });
      expect(result).toEqual([]);
    });

    it("handles case-insensitive queries", async () => {
      const query = "JoHn";
      const mockUsers = [
        {
          id: "user1",
          name: "John Doe",
          surname: "Doe",
          username: "johndoe",
          avatar: "/avatar1.png",
        },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await searchAction(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "john" } },
            { surname: { contains: "john" } },
            { username: { contains: "john" } },
          ],
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("throws error on database failure", async () => {
      const query = "john";
      prisma.user.findMany.mockRejectedValue(new Error("DB Error"));

      await expect(searchAction(query)).rejects.toThrow(
        "Something went wrong, Kuma"
      );
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: query.toLowerCase() } },
            { surname: { contains: query.toLowerCase() } },
            { username: { contains: query.toLowerCase() } },
          ],
        },
      });
    });

    it("handles empty query string", async () => {
      const query = "";
      const mockUsers = [];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await searchAction(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "" } },
            { surname: { contains: "" } },
            { username: { contains: "" } },
          ],
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });
});

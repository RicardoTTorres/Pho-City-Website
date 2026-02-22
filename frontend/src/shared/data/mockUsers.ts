// src/shared/data/mockUsers.ts
export type MockUser = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Editor";
};

export const mockUsers: MockUser[] = [
  { id: 1, name: "Huu Tran", email: "admin@phocity.com", role: "Admin" },
  { id: 2, name: "Jane Doe", email: "editor@phocity.com", role: "Editor" },
];

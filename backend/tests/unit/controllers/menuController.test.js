import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMenu,
  getAdminMenu,
  addCategory,
  editCategory,
  deleteCategory,
  addItem,
  editItem,
  deleteItem,
  reorderCategories,
  reorderCategoryItems,
  getFeaturedItems,
} from "../../../src/controllers/menuController.js";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
    getConnection: vi.fn(),
  },
}));

vi.mock("../../../src/controllers/activityController.js", () => ({
  logActivity: vi.fn(),
}));

import { pool } from "../../../src/db/connect_db.js";
import { logActivity } from "../../../src/controllers/activityController.js";

function mockReqRes({
  body = {},
  params = {},
  user = { email: "admin@test.com" },
} = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };
  const req = { body, params, user };
  return { req, res };
}

function mockConn(overrides = {}) {
  return {
    beginTransaction: vi.fn().mockResolvedValue(),
    query: vi.fn(),
    rollback: vi.fn().mockResolvedValue(),
    commit: vi.fn().mockResolvedValue(),
    release: vi.fn(),
    escape: vi.fn((v) => v),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getMenu", () => {
  it("returns formatted menu grouped by category", async () => {
    const categories = [{ id: 1, name: "Soups" }];
    const items = [
      {
        id: 10,
        name: "Pho",
        description: "Hot soup",
        price: 12.5,
        image: "pho.jpg",
        visible: 1,
        category_id: 1,
      },
    ];
    pool.query
      .mockResolvedValueOnce([categories])
      .mockResolvedValueOnce([items]);

    const { req, res } = mockReqRes();
    await getMenu(req, res);

    expect(res.json).toHaveBeenCalledWith({
      menu: {
        categories: [
          {
            id: "1",
            name: "Soups",
            items: [
              {
                id: "10",
                name: "Pho",
                description: "Hot soup",
                price: "$12.50",
                image: "pho.jpg",
              },
            ],
          },
        ],
      },
    });
  });

  it("sets image to null when item has no image", async () => {
    const categories = [{ id: 1, name: "Soups" }];
    const items = [
      {
        id: 10,
        name: "Pho",
        description: null,
        price: 10,
        image: null,
        visible: 1,
        category_id: 1,
      },
    ];
    pool.query
      .mockResolvedValueOnce([categories])
      .mockResolvedValueOnce([items]);

    const { req, res } = mockReqRes();
    await getMenu(req, res);

    const result = res.json.mock.calls[0][0];
    expect(result.menu.categories[0].items[0].image).toBeNull();
  });

  it("excludes items not matching a category", async () => {
    const categories = [{ id: 1, name: "Soups" }];
    const items = [
      {
        id: 10,
        name: "Pho",
        description: null,
        price: 10,
        image: null,
        visible: 1,
        category_id: 1,
      },
      {
        id: 20,
        name: "Tea",
        description: null,
        price: 3,
        image: null,
        visible: 1,
        category_id: 2,
      },
    ];
    pool.query
      .mockResolvedValueOnce([categories])
      .mockResolvedValueOnce([items]);

    const { req, res } = mockReqRes();
    await getMenu(req, res);

    const result = res.json.mock.calls[0][0];
    expect(result.menu.categories[0].items).toHaveLength(1);
    expect(result.menu.categories[0].items[0].id).toBe("10");
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes();
    await getMenu(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error fetching menu" });
  });
});

describe("getAdminMenu", () => {
  it("returns all items including hidden ones with admin fields", async () => {
    const categories = [{ id: 2, name: "Drinks" }];
    const items = [
      {
        id: 20,
        name: "Tea",
        description: "Green tea",
        price: 3.0,
        image: null,
        visible: 0,
        featured: 1,
        featuredPosition: 1,
        category_id: 2,
      },
    ];
    pool.query
      .mockResolvedValueOnce([categories])
      .mockResolvedValueOnce([items]);

    const { req, res } = mockReqRes();
    await getAdminMenu(req, res);

    expect(res.json).toHaveBeenCalledWith({
      menu: {
        categories: [
          {
            id: "2",
            name: "Drinks",
            items: [
              {
                id: "20",
                name: "Tea",
                description: "Green tea",
                price: 3.0,
                image: null,
                visible: false,
                featured: true,
                featuredPosition: 1,
                categoryId: 2,
              },
            ],
          },
        ],
      },
    });
  });

  it("sets featuredPosition to null when undefined in db row", async () => {
    const categories = [{ id: 2, name: "Drinks" }];
    const items = [
      {
        id: 20,
        name: "Tea",
        description: null,
        price: 3.0,
        image: null,
        visible: 1,
        featured: 0,
        featuredPosition: undefined,
        category_id: 2,
      },
    ];
    pool.query
      .mockResolvedValueOnce([categories])
      .mockResolvedValueOnce([items]);

    const { req, res } = mockReqRes();
    await getAdminMenu(req, res);

    const result = res.json.mock.calls[0][0];
    expect(result.menu.categories[0].items[0].featuredPosition).toBeNull();
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes();
    await getAdminMenu(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error fetching admin menu",
    });
  });
});

describe("addCategory", () => {
  it("inserts category at the end and returns its id", async () => {
    pool.query
      .mockResolvedValueOnce([[{ maxPos: 2 }]])
      .mockResolvedValueOnce([{ insertId: 5 }]);

    const { req, res } = mockReqRes({ body: { name: "Desserts" } });
    await addCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "5" });
    expect(logActivity).toHaveBeenCalledWith(
      "created",
      "menu_category",
      "Created category 'Desserts'",
      "admin@test.com",
    );
  });

  it("returns 400 when name is missing", async () => {
    const { req, res } = mockReqRes({ body: {} });
    await addCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required properties",
    });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes({ body: { name: "Test" } });
    await addCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error adding category" });
  });
});

describe("editCategory", () => {
  it("updates category name and returns ok", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const { req, res } = mockReqRes({
      params: { id: "3" },
      body: { name: "Updated Name" },
    });
    await editCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "menu_category",
      "Renamed category to 'Updated Name'",
      "admin@test.com",
    );
  });

  it("returns 400 when name is missing", async () => {
    const { req, res } = mockReqRes({ params: { id: "3" }, body: {} });
    await editCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing properties to edit",
    });
  });

  it("returns 404 when no matching row found", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const { req, res } = mockReqRes({
      params: { id: "99" },
      body: { name: "Ghost" },
    });
    await editCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No rows in database matching id 99",
    });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes({
      params: { id: "3" },
      body: { name: "Test" },
    });
    await editCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error editing category" });
  });
});

describe("deleteCategory", () => {
  it("deletes category and responds with 204", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const { req, res } = mockReqRes({ params: { id: "3" } });
    await deleteCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(logActivity).toHaveBeenCalledWith(
      "deleted",
      "menu_category",
      "Deleted a menu category",
      "admin@test.com",
    );
  });

  it("returns 404 when no matching row found", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const { req, res } = mockReqRes({ params: { id: "99" } });
    await deleteCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No rows in database matching id 99",
    });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes({ params: { id: "3" } });
    await deleteCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error deleting category" });
  });
});

describe("addItem", () => {
  it("inserts item and returns its id", async () => {
    pool.query
      .mockResolvedValueOnce([[{ maxPos: 0 }]])
      .mockResolvedValueOnce([{ insertId: 42 }]);

    const { req, res } = mockReqRes({
      body: { name: "Spring Roll", price: 5.0, category: 1 },
    });
    await addItem(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "42" });
    expect(logActivity).toHaveBeenCalledWith(
      "created",
      "menu_item",
      "Added menu item 'Spring Roll'",
      "admin@test.com",
    );
  });

  it("clears featuredPosition when item is not featured", async () => {
    pool.query
      .mockResolvedValueOnce([[{ maxPos: 0 }]])
      .mockResolvedValueOnce([{ insertId: 43 }]);

    const { req, res } = mockReqRes({
      body: {
        name: "Roll",
        price: 5.0,
        category: 1,
        featured: false,
        featuredPosition: 2,
      },
    });
    await addItem(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 400 when name is missing", async () => {
    const { req, res } = mockReqRes({ body: { price: 5.0, category: 1 } });
    await addItem(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required properties",
    });
  });

  it("returns 400 when price is missing", async () => {
    const { req, res } = mockReqRes({ body: { name: "Roll", category: 1 } });
    await addItem(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required properties",
    });
  });

  it("returns 400 when category is missing", async () => {
    const { req, res } = mockReqRes({ body: { name: "Roll", price: 5.0 } });
    await addItem(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required properties",
    });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes({
      body: { name: "Roll", price: 5.0, category: 1 },
    });
    await addItem(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error adding item" });
  });
});

describe("editItem", () => {
  it("updates item and returns ok", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const { req, res } = mockReqRes({
      params: { id: "10" },
      body: { name: "Updated Pho" },
    });
    await editItem(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "menu_item",
      "Updated menu item #10",
      "admin@test.com",
    );
  });

  it("clears featuredPosition when featured is set to false", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const { req, res } = mockReqRes({
      params: { id: "10" },
      body: { featured: false, featuredPosition: 1 },
    });
    await editItem(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 400 when no editable fields are provided", async () => {
    const { req, res } = mockReqRes({ params: { id: "10" }, body: {} });
    await editItem(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing properties to edit",
    });
  });

  it("returns 404 when no matching row found", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const { req, res } = mockReqRes({
      params: { id: "999" },
      body: { name: "Ghost" },
    });
    await editItem(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No rows in database matching id 999",
    });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes({
      params: { id: "10" },
      body: { name: "Pho" },
    });
    await editItem(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error editing item" });
  });
});

describe("deleteItem", () => {
  it("deletes item and responds with 204", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const { req, res } = mockReqRes({ params: { id: "10" } });
    await deleteItem(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(logActivity).toHaveBeenCalledWith(
      "deleted",
      "menu_item",
      "Deleted menu item #10",
      "admin@test.com",
    );
  });

  it("returns 404 when no matching row found", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const { req, res } = mockReqRes({ params: { id: "999" } });
    await deleteItem(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No rows in database matching id 999",
    });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes({ params: { id: "10" } });
    await deleteItem(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error deleting item" });
  });
});

describe("reorderCategories", () => {
  it("reorders categories and commits transaction", async () => {
    const conn = mockConn();
    conn.query
      .mockResolvedValueOnce([[{ category_id: 1 }, { category_id: 2 }]])
      .mockResolvedValueOnce([[{ maxPos: 1 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);
    pool.getConnection.mockResolvedValueOnce(conn);

    const { req, res } = mockReqRes({ body: { categoryIds: [1, 2] } });
    await reorderCategories(req, res);

    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "menu_category",
      "Reordered menu categories",
      "admin@test.com",
    );
  });

  it("returns 400 for empty categoryIds array", async () => {
    const { req, res } = mockReqRes({ body: { categoryIds: [] } });
    await reorderCategories(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "categoryIds must be a non-empty array",
    });
  });

  it("returns 400 when categoryIds is not an array", async () => {
    const { req, res } = mockReqRes({ body: { categoryIds: "1,2" } });
    await reorderCategories(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rolls back and returns 400 when some categoryIds do not exist", async () => {
    const conn = mockConn();
    conn.query.mockResolvedValueOnce([[{ category_id: 1 }]]);
    pool.getConnection.mockResolvedValueOnce(conn);

    const { req, res } = mockReqRes({ body: { categoryIds: [1, 2] } });
    await reorderCategories(req, res);

    expect(conn.rollback).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "One or more categoryIds do not exist",
    });
  });

  it("rolls back and returns 500 on db error", async () => {
    const conn = mockConn();
    conn.query.mockRejectedValueOnce(new Error("DB error"));
    pool.getConnection.mockResolvedValueOnce(conn);

    const { req, res } = mockReqRes({ body: { categoryIds: [1, 2] } });
    await reorderCategories(req, res);

    expect(conn.rollback).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to reorder categories",
    });
  });
});

describe("reorderCategoryItems", () => {
  it("reorders items and commits transaction", async () => {
    const conn = mockConn();
    conn.query
      .mockResolvedValueOnce([[{ item_id: 10 }, { item_id: 20 }]])
      .mockResolvedValueOnce([[{ maxPos: 1 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);
    pool.getConnection.mockResolvedValueOnce(conn);

    const { req, res } = mockReqRes({
      params: { categoryId: "1" },
      body: { itemIds: [10, 20] },
    });
    await reorderCategoryItems(req, res);

    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(logActivity).toHaveBeenCalledWith(
      "updated",
      "menu_item",
      "Reordered items in a category",
      "admin@test.com",
    );
  });

  it("returns 400 when categoryId is missing", async () => {
    const { req, res } = mockReqRes({ params: {}, body: { itemIds: [10] } });
    await reorderCategoryItems(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "categoryId is required" });
  });

  it("returns 400 for empty itemIds array", async () => {
    const { req, res } = mockReqRes({
      params: { categoryId: "1" },
      body: { itemIds: [] },
    });
    await reorderCategoryItems(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "itemIds must be a non-empty array",
    });
  });

  it("returns 400 when itemIds is not an array", async () => {
    const { req, res } = mockReqRes({
      params: { categoryId: "1" },
      body: { itemIds: "10,20" },
    });
    await reorderCategoryItems(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rolls back and returns 400 when some itemIds do not belong to the category", async () => {
    const conn = mockConn();
    conn.query.mockResolvedValueOnce([[{ item_id: 10 }]]); // only 1 found, 2 requested
    pool.getConnection.mockResolvedValueOnce(conn);

    const { req, res } = mockReqRes({
      params: { categoryId: "1" },
      body: { itemIds: [10, 20] },
    });
    await reorderCategoryItems(req, res);

    expect(conn.rollback).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "One or more itemIds do not exist or do not belong to this category",
    });
  });

  it("rolls back and returns 500 on db error", async () => {
    const conn = mockConn();
    conn.query.mockRejectedValueOnce(new Error("DB error"));
    pool.getConnection.mockResolvedValueOnce(conn);

    const { req, res } = mockReqRes({
      params: { categoryId: "1" },
      body: { itemIds: [10, 20] },
    });
    await reorderCategoryItems(req, res);

    expect(conn.rollback).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to reorder items" });
  });
});

describe("getFeaturedItems", () => {
  it("returns formatted featured items", async () => {
    const items = [
      {
        id: 5,
        name: "Pho Special",
        description: "Our best pho",
        price: 15.99,
        image: "special.jpg",
        featuredPosition: 1,
      },
    ];
    pool.query.mockResolvedValueOnce([items]);

    const { req, res } = mockReqRes();
    await getFeaturedItems(req, res);

    expect(res.json).toHaveBeenCalledWith({
      items: [
        {
          id: "5",
          name: "Pho Special",
          description: "Our best pho",
          price: "$15.99",
          image: "special.jpg",
          featuredPosition: 1,
        },
      ],
    });
  });

  it("sets image to null when item has no image", async () => {
    const items = [
      {
        id: 5,
        name: "Pho",
        description: null,
        price: 10.0,
        image: null,
        featuredPosition: 1,
      },
    ];
    pool.query.mockResolvedValueOnce([items]);

    const { req, res } = mockReqRes();
    await getFeaturedItems(req, res);

    const result = res.json.mock.calls[0][0];
    expect(result.items[0].image).toBeNull();
  });

  it("returns empty items array when none are featured", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const { req, res } = mockReqRes();
    await getFeaturedItems(req, res);

    expect(res.json).toHaveBeenCalledWith({ items: [] });
  });

  it("returns 500 on db error", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB error"));
    const { req, res } = mockReqRes();
    await getFeaturedItems(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error fetching featured items",
    });
  });
});

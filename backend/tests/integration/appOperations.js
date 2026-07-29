import request from "supertest";
import { expect } from "vitest";

export async function verifyRepresentativeOperations(app) {
  const agent = request.agent(app);
  const login = await agent.post("/api/admin/login").send({
    email: "integration-admin@phocity.test",
    password: "integration-test-password",
  });
  expect(login.status).toBe(200);

  const forgot = await agent.post("/api/admin/forgot-password").send({
    email: "integration-admin@phocity.test",
  });
  expect(forgot.status).toBe(200);

  const category = await agent
    .post("/api/menu/categories")
    .send({ name: "Integration Category" });
  expect(category.status).toBe(201);

  const item = await agent.post("/api/menu/items").send({
    name: "Integration Pho",
    description: "Migration verification item",
    price: 12.5,
    image: null,
    visible: true,
    featured: true,
    featuredPosition: 1,
    popular: true,
    category: Number(category.body.id),
  });
  expect(item.status).toBe(201);

  const menu = await agent.get("/api/menu");
  expect(menu.status).toBe(200);
  expect(menu.body.menu.categories[0].items[0]).toMatchObject({
    name: "Integration Pho",
    popular: true,
  });

  const aboutPayload = {
    heroTitle: "Integration About",
    heroIntro: "Intro",
    heroImage: "https://example.test/hero.jpg",
    beginningTitle: "Beginning",
    beginningBody: "Beginning body",
    beginningImage: "https://example.test/beginning.jpg",
    beginningCaption: "Beginning caption",
    foodTitle: "Food",
    foodBody: "Food body",
    foodImage: "https://example.test/food.jpg",
    foodCaption: "Food caption",
    foodHighlights: "Fresh herbs,Slow broth",
    commitmentTitle: "Commitment",
    commitmentBody: "Commitment body",
    commitmentImage: "https://example.test/commitment.jpg",
    commitmentCaption: "Commitment caption",
    closingText: "Closing",
    previewHeading: "Preview",
    previewBody: "Preview body",
    previewButtonLabel: "View menu",
  };
  const aboutUpdate = await agent.put("/api/about").send(aboutPayload);
  expect(aboutUpdate.status).toBe(200);
  const about = await agent.get("/api/about");
  expect(about.status).toBe(200);
  expect(about.body.about).toMatchObject(aboutPayload);

  const logout = await agent.post("/api/admin/logout");
  expect(logout.status).toBe(200);
}

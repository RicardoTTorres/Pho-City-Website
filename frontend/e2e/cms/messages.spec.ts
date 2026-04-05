import { test, expect, type Page } from "@playwright/test";
import { mockAdminSession } from "../helpers/cms-auth";



const MOCK_THREAD_GMAIL = {
  id: "thread-gmail-1",
  messages: [
    {
      id: "msg-1",
      threadId: "thread-gmail-1",
      fromEmail: "customer@example.com",
      fromName: "Jane Smith",
      fromSelf: false,
      date: new Date(Date.now() - 3_600_000).toISOString(),
      subject: "Question about your pho",
      snippet: "Hello, I was wondering about your broth...",
      body: "Hello, I was wondering about your broth — is it gluten free?",
      isUnread: true,
      isPreview: false,
      isGmail: true,
    },
  ],
  isUnread: true,
  date: new Date(Date.now() - 3_600_000).toISOString(),
  snippet: "Hello, I was wondering about your broth...",
  people: ["Jane Smith"],
  isPreview: false,
  isGmail: true,
};

const MOCK_THREAD_SAVED = {
  id: "thread-saved-1",
  messages: [
    {
      id: "msg-s1",
      threadId: "thread-saved-1",
      fromEmail: "visitor@example.com",
      fromName: "Bob Lee",
      fromSelf: false,
      date: new Date(Date.now() - 7_200_000).toISOString(),
      subject: "Reservation inquiry",
      snippet: "Hi, do you take reservations?",
      body: "Hi, do you take reservations for large groups?",
      isUnread: false,
      isPreview: false,
      isGmail: false,
    },
  ],
  isUnread: false,
  date: new Date(Date.now() - 7_200_000).toISOString(),
  snippet: "Hi, do you take reservations?",
  people: ["Bob Lee"],
  isPreview: false,
  isGmail: false,
};


const MAIL_ROUTE = /\/api\/admin\/mail/;

function registerMailMock(page: Page, authenticated: boolean) {
  return page.route(MAIL_ROUTE, (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/oauth/state")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated,
          registered: true,
          email: "phocity@gmail.com",
        }),
      });
    }

    if (url.includes("/savedthreads")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ threads: [MOCK_THREAD_SAVED] }),
      });
    }

    if (url.includes("/read") || url.includes("/unread") || url.includes("/reply")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }


    if (method === "GET" && url.includes("/threads")) {
   
      const afterThreads = url.split("/threads/")[1];
      if (afterThreads && !afterThreads.startsWith("?")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_THREAD_GMAIL),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          threads: authenticated ? [MOCK_THREAD_GMAIL] : [],
          nextPageToken: null,
        }),
      });
    }

   
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

async function setupMessagesPage(page: Page, authenticated = true) {
  await mockAdminSession(page);
  await registerMailMock(page, authenticated);

  await page.goto("/cms/messages");
  await expect(
    page.getByText(authenticated ? "Jane Smith" : "Bob Lee"),
  ).toBeVisible({ timeout: 12_000 });
}



test.describe("CMS Messages page — thread list", () => {
  test.beforeEach(async ({ page }) => {
    await setupMessagesPage(page);
  });

  test("thread preview cards are rendered", async ({ page }) => {
    await expect(page.getByText("Jane Smith")).toBeVisible();
    await expect(
      page.getByText("Hello, I was wondering about your broth..."),
    ).toBeVisible();
  });

  test("unread thread shows the red unread indicator", async ({ page }) => {
    const threadCard = page.locator("article").first();
    await expect(
      threadCard.locator("div.bg-brand-red, div[class*='bg-brand-red']"),
    ).toBeVisible();
  });

  test("'Customers only' toggle is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /customers only/i }),
    ).toBeVisible();
  });

  test("'Customers only' toggle filters internal threads", async ({ page }) => {
    await expect(page.getByText("Jane Smith")).toBeVisible();
    await page.getByRole("button", { name: /customers only/i }).click();
    await expect(page.getByText("Jane Smith")).toBeVisible();
  });
});



test.describe("CMS Messages page — thread selection", () => {
  test.beforeEach(async ({ page }) => {
    await setupMessagesPage(page);
  });

  test("right panel shows 'No Conversation Selected' before clicking a thread", async ({
    page,
  }) => {
    await expect(page.getByText("No Conversation Selected")).toBeVisible();
  });

  test("clicking a thread opens its messages in the right panel", async ({
    page,
  }) => {
    await page.locator("article").first().click();
    await expect(
      page.getByText(
        "Hello, I was wondering about your broth — is it gluten free?",
      ),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("opened thread shows the sender's name in the message view", async ({
    page,
  }) => {
    await page.locator("article").first().click();
    const rightPanel = page.locator("div.overflow-y-auto").last();
    await expect(rightPanel.getByText("Jane Smith")).toBeVisible({
      timeout: 8_000,
    });
  });

  test("clicking the same thread again deselects it", async ({ page }) => {
    await page.locator("article").first().click();
    await expect(page.getByText("No Conversation Selected")).not.toBeVisible();
    await page.locator("article").first().click();
    await expect(page.getByText("No Conversation Selected")).toBeVisible({
      timeout: 5_000,
    });
  });
});



test.describe("CMS Messages page — reply", () => {
  test.beforeEach(async ({ page }) => {
    await setupMessagesPage(page);
    await page.locator("article").first().click();
    await expect(
      page.getByRole("button", { name: /reply/i }),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("'Reply' button reveals the reply composer", async ({ page }) => {
    await page.getByRole("button", { name: /reply/i }).click();
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
  });

  test("'Cancel' in the composer hides it", async ({ page }) => {
    await page.getByRole("button", { name: /reply/i }).click();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.locator("textarea")).not.toBeVisible();
    await expect(page.getByRole("button", { name: /reply/i })).toBeVisible();
  });

  test("typing in the composer and sending calls the reply API", async ({
    page,
  }) => {
    let replyCalled = false;
    await page.route(MAIL_ROUTE, (route) => {
      if (route.request().url().includes("/reply")) {
        replyCalled = true;
        return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_THREAD_GMAIL),
      });
    });

    await page.getByRole("button", { name: /reply/i }).click();
    await page.locator("textarea").fill("Thank you for reaching out!");
    await page.getByRole("button", { name: /send/i }).click();

    await expect.poll(() => replyCalled, { timeout: 8_000 }).toBe(true);
  });

  test("reply composer shows 'Sending...' status while in-flight", async ({
    page,
  }) => {
    await page.route(MAIL_ROUTE, async (route) => {
      if (route.request().url().includes("/reply")) {
        await new Promise((r) => setTimeout(r, 800));
        return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_THREAD_GMAIL),
      });
    });

    await page.getByRole("button", { name: /reply/i }).click();
    await page.locator("textarea").fill("Testing in-flight state");
    await page.getByRole("button", { name: /send/i }).click();

    await expect(page.getByText("Sending...")).toBeVisible({ timeout: 3_000 });
  });
});



test.describe("CMS Messages page — thread deletion", () => {
  test.beforeEach(async ({ page }) => {
    await setupMessagesPage(page);
  });

  test("Gmail thread shows a delete (trash) button on its preview card", async ({
    page,
  }) => {
    const threadCard = page.locator("article").first();
    await expect(threadCard.locator("button[title='Delete']")).toBeVisible();
  });

  test("clicking the delete button removes the thread from the list", async ({
    page,
  }) => {
    let deleteCalled = false;
    await page.route(MAIL_ROUTE, (route) => {
      if (route.request().method() === "DELETE") {
        deleteCalled = true;
        return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_THREAD_GMAIL),
      });
    });

    await page.locator("article button[title='Delete']").click();

    expect(deleteCalled).toBe(true);
    await expect(page.getByText("Jane Smith")).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test("deleting an open thread clears the right panel", async ({ page }) => {
    await page.route(MAIL_ROUTE, (route) => {
      if (route.request().method() === "DELETE") {
        return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_THREAD_GMAIL),
      });
    });

    await page.locator("article").first().click();
    await expect(
      page.getByText("Hello, I was wondering about your broth — is it gluten free?"),
    ).toBeVisible({ timeout: 5_000 });

    await page.locator("article button[title='Delete']").click();

    await expect(page.getByText("No Conversation Selected")).toBeVisible({
      timeout: 5_000,
    });
  });
});



test.describe("CMS Messages page — saved threads (no Gmail auth)", () => {
  test("shows saved DB threads when Gmail is not connected", async ({
    page,
  }) => {
    await setupMessagesPage(page, false);
    await expect(page.getByText("Bob Lee")).toBeVisible();
    await expect(page.getByText("Hi, do you take reservations?")).toBeVisible();
  });

  test("right panel shows 'Gmail Not Connected' prompt when unauthenticated", async ({
    page,
  }) => {
    await setupMessagesPage(page, false);
    await expect(page.getByText("Gmail Not Connected")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /authenticate with google/i }),
    ).toBeVisible();
  });
});

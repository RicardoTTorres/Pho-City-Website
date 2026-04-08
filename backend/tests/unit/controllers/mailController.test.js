import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getState,
  createAuthUrl,
  finishAuth,
  getThreads,
  getThread,
  markRead,
  markUnread,
  reply,
  trashThread,
  getSavedThreads
} from "../../../src/controllers/mailController.js";

vi.mock("../../../src/db/connect_db.js", () => ({
  pool: {
    query: vi.fn(),
    getConnection: vi.fn(),
  },
}));

vi.mock("../../../src/services/settingsService.js", () => ({
  getSubmissions: vi.fn()
}));

vi.mock("../../../src/services/gmailService.js", () => ({
  getEmailClient: vi.fn(),
  GmailClient: vi.fn(class {
    saveTokens = vi.fn();
  })
}));

vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: vi.fn(class {
        generateAuthUrl = vi.fn();
        getToken = vi.fn(() => ({ tokens: {} }));
        setCredentials = vi.fn();
      })
    },
    gmail: vi.fn(() => ({
      users: {
        getProfile: vi.fn(async () => ({ data: { emailAddress: "admin@test.com" } }))
      }
    }))
  }
}));

import { pool } from "../../../src/db/connect_db.js";
import { google } from "googleapis";
import { getEmailClient, GmailClient, ImapClient } from "../../../src/services/gmailService.js";
import { getSubmissions } from "../../../src/services/settingsService.js";


function mockReqRes({
  body = {},
  params = {},
  user = { email: "admin@test.com" },
  query = {}
} = {}) {
  const res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
    redirect: vi.fn()
  };
  const req = { body, params, user, query };
  return { req, res };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getState", () => {
  it("returns status 200 with json matching getEmailClient result", async () => {
    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: {}
    });

    const {req, res} = mockReqRes();

    await getState(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      authenticated: true,
      registered: true,
      email: "admin@test.com"
    });
  });

  it("returns status 500 with error message if getEmailClient throws error", async () => {
    const err = new Error();
    getEmailClient.mockRejectedValueOnce(err);
    
    const {req, res} = mockReqRes();

    await getState(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error getting authentication state"
    });
  });
});

describe("createAuthUrl", () => {
  it("returns redirect url if google api throws no errors", async () => {
    const {req, res} = mockReqRes();
    const url = 'url';

    google.auth.OAuth2.mockImplementationOnce(class {
      generateAuthUrl = vi.fn(() => url);
    });

    await createAuthUrl(req, res);

    expect(res.redirect).toHaveBeenCalledWith(url);
  });

  it("returns status 500 with error if auth url cannot be generated", async () => {
    const {req, res} = mockReqRes();

    google.auth.OAuth2.mockImplementationOnce(class {
      generateAuthUrl = vi.fn(() => { throw new Error(); })
    });

    await createAuthUrl(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error creating google auth url"
    });
  });

  it("returns status 500 with error if oauth2 client cannot be generated", async () => {
    const {req, res} = mockReqRes();

    google.auth.OAuth2.mockImplementationOnce(class {
      constructor() { throw new Error(); }
    });

    await createAuthUrl(req, res);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error creating google auth url"
    });
  });
});

describe("finishAuth", () => {
  it("completes finish auth flow and sends html if everything works", async () => {
    const {req, res} = mockReqRes({query: {code: "abcd"}});

    await finishAuth(req, res);

    expect(res.send).toHaveBeenCalled();
  });

  it("returns status 400 if missing required query params", async () => {
    const {req, res} = mockReqRes({query: {}});

    await finishAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).not.toHaveBeenCalled();
  });

  it("returns status 500 if error occurs", async () => {
    const {req, res} = mockReqRes({query: {code: "abcd"}});

    google.auth.OAuth2.mockImplementationOnce(class {
      constructor() { throw new Error(); }
    });

    await finishAuth(req, res);

    expect(res.send).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error completing oauth"
    });
  });

  it("returns status 500 if gmail api does not return email", async () => {
    const {req, res} = mockReqRes({query: {code: "abcd"}});

    google.gmail.mockImplementationOnce(() => ({
      users: {
        getProfile: vi.fn(() => ({}))
      }
    }));
    
    await finishAuth(req, res);

    expect(res.send).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error completing oauth"
    });
  });
});

describe("getThreads", () => {
  it("returns status 200 if successful", async () => {
    const {req, res} = mockReqRes();

    const data = {threads: [], nextPageToken: ""};

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { fetchThreads: vi.fn(async () => data) }
    })

    await getThreads(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  it("returns status 401 if not authenticated", async () => {
    const {req, res} = mockReqRes();

    const data = {threads: [], nextPageToken: ""};

    getEmailClient.mockResolvedValueOnce({
      authenticated: false,
      registered: true,
      email: "admin@test.com",
      client: { fetchThreads: vi.fn(async () => data) }
    });

    await getThreads(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({error: "Not authenticated to access gmail"});
  });

  it("returns status 500 if error occurs", async () => {
    const {req, res} = mockReqRes();

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { fetchThreads: vi.fn(async () => { throw new Error(); }) }
    });

    await getThreads(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error getting threads" });
  });
});

describe("getThread", () => {
  it("returns status 200 if successful", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}});

    const data = {};

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { fetchThread: vi.fn(async () => data) }
    });

    await getThread(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  it("returns status 500 if error", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}});

    const data = {};

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { fetchThread: vi.fn(async () => { throw new Error(); }) }
    });

    await getThread(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error getting thread" });
  });

  it("returns status 401 if gmail not authenticated", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}});

    const data = {};

    getEmailClient.mockResolvedValueOnce({
      authenticated: false,
      registered: true,
      email: "admin@test.com",
      client: { fetchThread: vi.fn(async () => data) }
    });

    await getThread(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated to access gmail" });
  });

  it("returns status 400 if id not provided", async () => {
    const {req, res} = mockReqRes();

    const data = {};

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { fetchThread: vi.fn(async () => data) }
    });

    await getThread(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required field id" });
  });
});

for (const [name, func] of [["markRead", markRead], ["markUnread", markUnread]]) {
  describe(name, () => {
    it("returns status 400 if id not provided", async () => {
      const {req, res} = mockReqRes();

      getEmailClient.mockResolvedValueOnce({
        authenticated: true,
        registered: true,
        email: "admin@test.com",
        client: { [name]: vi.fn() }
      });

      await func(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing required field id" });
    });

    it("returns status 500 if db error (db flag enabled)", async () => {
      const {req, res} = mockReqRes({params: {id: "abc"}, query: {db: true}});

      getEmailClient.mockResolvedValueOnce({
        authenticated: false,
        registered: false,
        email: "admin@test.com",
        client: undefined
      });
      pool.query.mockRejectedValueOnce(new Error());

      await func(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("returns status 500 if gmail error (db flag disabled)", async () => {
      const {req, res} = mockReqRes({params: {id: "abc"}});

      getEmailClient.mockResolvedValueOnce({
        authenticated: true,
        registered: true,
        email: "admin@test.com",
        client: { [name]: vi.fn(async () => { throw new Error(); }) }
      });

      await func(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("returns status 200 if gmail not authenticated (db flag enabled, ignores gmail)", async () => {
      const {req, res} = mockReqRes({params: {id: "abc"}, query: {db: true}});

      getEmailClient.mockResolvedValueOnce({
        authenticated: false,
        registered: false,
        email: "admin@test.com",
        client: undefined
      });

      await func(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ok: true});
    });

    it("returns status 401 if gmail not authenticated (db flag disabled)", async () => {
      const {req, res} = mockReqRes({params: {id: "abc"}});

      getEmailClient.mockResolvedValueOnce({
        authenticated: false,
        registered: true,
        email: "admin@test.com",
        client: { [name]: vi.fn(async () => { throw new Error(); }) }
      });

      await func(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated to access gmail" });
    });

    it("returns status 200 if db request successful (db flag enabled)", async () => {
      const {req, res} = mockReqRes({params: {id: "abc"}, query: {db: true}});

      getEmailClient.mockResolvedValueOnce({
        authenticated: true,
        registered: true,
        email: "admin@test.com",
        client: { [name]: vi.fn() }
      });

      await func(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ok: true});
    });

    it("returns status 200 if gmail request successful (db flag disabled)", async () => {
      const {req, res} = mockReqRes({params: {id: "abc"}});

      getEmailClient.mockResolvedValueOnce({
        authenticated: true,
        registered: true,
        email: "admin@test.com",
        client: { [name]: vi.fn() }
      });

      await func(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });
  });
}

describe("reply", () => {
  it("returns status 400 if missing id", async () => {
    const {req, res} = mockReqRes();

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { reply: vi.fn() }
    });

    await reply(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required field id" });
  });

  it("returns status 400 if missing body", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}});

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { reply: vi.fn() }
    });

    await reply(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required field body" });
  });

  it("returns status 401 if gmail not authenticated", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}, body: {body: "hello world"}});

    getEmailClient.mockResolvedValueOnce({
      authenticated: false,
      registered: true,
      email: "admin@test.com",
      client: { reply: vi.fn() }
    });

    await reply(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated to access gmail" });
  });

  it("returns status 500 if error occurs", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}, body: {body: "hello world"}});

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { reply: vi.fn(async () => { throw new Error(); }) }
    });

    await reply(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error replying to thread" });
  });

  it("returns status 200 if successful", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}, body: {body: "hello world"}});

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { reply: vi.fn() }
    });

    await reply(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});

describe("trashThread", () => {
  it("returns status 400 if missing id", async () => {
    const {req, res} = mockReqRes();

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { trash: vi.fn() }
    });

    await trashThread(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required field id" });
  });

  it("returns status 401 if gmail not authenticated", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}});

    getEmailClient.mockResolvedValueOnce({
      authenticated: false,
      registered: true,
      email: "admin@test.com",
      client: { trash: vi.fn() }
    });

    await trashThread(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated to access gmail" });
  });

  it("returns status 500 if error occurs", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}});

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { trash: vi.fn(async () => { throw new Error(); }) }
    });

    await trashThread(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error trashing thread" });
  });

  it("returns status 200 if successful", async () => {
    const {req, res} = mockReqRes({params: {id: "abcd"}});

    getEmailClient.mockResolvedValueOnce({
      authenticated: true,
      registered: true,
      email: "admin@test.com",
      client: { trash: vi.fn() }
    });

    await trashThread(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});

describe("getSavedThreads", () => {
  it("returns status 200 if successful", async () => {
    const {req, res} = mockReqRes();

    const date = '2026-04-08T00:00:00.000Z';
    const d = new Date(date);
    const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

    getSubmissions.mockResolvedValueOnce([
      {
        id: "abcd",
        name: "name",
        email: "email@example.com",
        message: "message",
        submitted_at: date,
        is_read: true,
      }
    ]);

    await getSavedThreads(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      threads: [{
        id: "abcd",
        messages: [
            {
                id: "abcd",
                threadId: "abcd",
                isUnread: false,
                snippet: "message",
                body: "message",
                date: utc,
                subject: "",
                fromName: "name",
                fromEmail: "email@example.com",
                fromSelf: false,
                isPreview: false,
                isGmail: false
            }
        ],
        isUnread: false,
        date: utc,
        snippet: "message",
        people: ["name"],
        isPreview: false,
        isGmail:false
      }],
      nextPageToken: undefined
    });
  });

  it("returns status 500 if error occurs", async () => {
    const {req, res} = mockReqRes();

    getSubmissions.mockRejectedValueOnce(new Error());

    await getSavedThreads(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error getting saved threads" });
  });
});
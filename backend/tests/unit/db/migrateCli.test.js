import { describe, expect, test, vi } from "vitest";
import { runCli } from "../../../src/db/migrateCli.js";

describe("migration CLI help", () => {
  test.each(["--help", "-h"])(
    "%s succeeds without database configuration or a connection",
    async (flag) => {
      const environment = new Proxy(
        {},
        {
          get() {
            throw new Error("Help must not read database configuration");
          },
        },
      );
      const createConnection = vi.fn(() => {
        throw new Error("Help must not create a database connection");
      });
      const logger = { log: vi.fn() };

      await expect(
        runCli({
          args: [flag],
          environment,
          createConnection,
          logger,
        }),
      ).resolves.toBeUndefined();
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining(
          "Usage: node src/db/migrateCli.js [up|status]",
        ),
      );
      expect(createConnection).not.toHaveBeenCalled();
    },
  );
});

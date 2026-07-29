import { afterEach, describe, expect, test } from "vitest";
import { integrationConfig } from "../../integration/dbTestHarness.js";

const originalEnvironment = { ...process.env };

function validEnvironment() {
  process.env.NODE_ENV = "test";
  process.env.RUN_DB_INTEGRATION_TESTS = "true";
  process.env.TEST_DB_HOST = "127.0.0.1";
  process.env.TEST_DB_USER = "root";
  process.env.TEST_DB_APPROVED_DATABASES = "pho_city_schema_test";
}

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("destructive integration database safeguards", () => {
  test("requires the explicit integration flag", () => {
    validEnvironment();
    delete process.env.RUN_DB_INTEGRATION_TESTS;
    expect(() => integrationConfig("pho_city_schema_test")).toThrow(
      "RUN_DB_INTEGRATION_TESTS=true",
    );
  });

  test("always rejects RDS hosts", () => {
    validEnvironment();
    process.env.TEST_DB_HOST = "production.abc.us-west-1.rds.amazonaws.com";
    process.env.TEST_DB_APPROVED_CI_HOST =
      "production.abc.us-west-1.rds.amazonaws.com";
    expect(() => integrationConfig("pho_city_schema_test")).toThrow(
      "RDS hosts are forbidden",
    );
  });

  test("requires an explicitly approved test database", () => {
    validEnvironment();
    expect(() => integrationConfig("pho_city_production")).toThrow(
      "not an explicitly approved integration-test database",
    );
  });
});

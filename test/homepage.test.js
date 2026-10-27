import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import Homepage from "../models/homepage.js";
import { getHomepage, saveHomepage } from "../controllers/homepageController.js";
import { requireAdmin } from "../middleware/auth.js";

const originalMethods = {
  findOne: Homepage.findOne,
  create: Homepage.create,
  findOneAndUpdate: Homepage.findOneAndUpdate,
};

const response = () => {
  const result = { statusCode: 200, body: undefined };
  return {
    result,
    status(code) {
      result.statusCode = code;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };
};

const section = (overrides = {}) => ({
  id: "hero",
  type: "hero",
  title: "Test Homepage",
  enabled: true,
  items: [],
  ...overrides,
});

afterEach(() => {
  Homepage.findOne = originalMethods.findOne;
  Homepage.create = originalMethods.create;
  Homepage.findOneAndUpdate = originalMethods.findOneAndUpdate;
});

test("GET /api/homepage returns seeded sections when no document exists", async () => {
  let created;
  Homepage.findOne = async () => null;
  Homepage.create = async (value) => {
    created = value;
    return value;
  };

  const res = response();
  await getHomepage({}, res);

  assert.equal(res.result.statusCode, 200);
  assert.deepEqual(res.result.body.sections.map((item) => item.id), [
    "hero",
    "services",
    "discounts",
    "benefits",
    "testimonials",
    "cta",
  ]);
  assert.equal(created.sections[0].sortOrder, 0);
});

test("PUT /api/homepage saves valid admin configuration in request order", async () => {
  Homepage.findOneAndUpdate = async (filter, update) => ({
    sections: update.$set.sections,
  });

  const res = response();
  await saveHomepage(
    {
      user: { id: "507f1f77bcf86cd799439011" },
      body: {
        sections: [
          section({ id: "custom", type: "custom" }),
          section({ id: "hero-2" }),
        ],
      },
    },
    res,
  );

  assert.equal(res.result.statusCode, 200);
  assert.deepEqual(res.result.body.sections.map((item) => item.id), ["custom", "hero-2"]);
  assert.deepEqual(res.result.body.sections.map((item) => item.sortOrder), [0, 1]);
});

test("PUT /api/homepage rejects missing authentication", () => {
  const res = response();
  const next = () => assert.fail("next should not be called");
  requireAdmin({ headers: {} }, res, next);
  assert.equal(res.result.statusCode, 401);
});

test("PUT /api/homepage rejects non-admin tokens", () => {
  const token = jwt.sign({ id: "user", role: "user" }, process.env.JWT_SECRET || "your-secret-key");
  const res = response();
  requireAdmin({ headers: { authorization: `Bearer ${token}` } }, res, () => {
    assert.fail("next should not be called");
  });
  assert.equal(res.result.statusCode, 403);
});

test("PUT /api/homepage accepts an admin token", () => {
  const token = jwt.sign({ id: "admin", role: "admin" }, process.env.JWT_SECRET || "your-secret-key");
  const res = response();
  let called = false;
  requireAdmin({ headers: { authorization: `Bearer ${token}` } }, res, () => {
    called = true;
  });
  assert.equal(called, true);
});

test("PUT /api/homepage rejects unsupported types and missing titles", async () => {
  const res = response();
  await saveHomepage({ body: { sections: [section({ type: "unknown", title: "" })] } }, res);

  assert.equal(res.result.statusCode, 400);
  assert.deepEqual(res.result.body.errors.map((error) => error.path), [
    "sections[0].type",
    "sections[0].title",
  ]);
});

test("PUT /api/homepage supports hiding, adding, and deleting sections", async () => {
  let saved;
  Homepage.findOneAndUpdate = async (filter, update) => {
    saved = update.$set.sections;
    return { sections: saved };
  };

  const res = response();
  await saveHomepage(
    {
      user: { id: "507f1f77bcf86cd799439011" },
      body: {
        sections: [
          section({ id: "hero", enabled: false }),
          section({ id: "custom-promo", type: "custom" }),
        ],
      },
    },
    res,
  );

  assert.equal(res.result.statusCode, 200);
  assert.equal(saved[0].enabled, false);
  assert.equal(saved.some((item) => item.id === "custom-promo"), true);
  assert.equal(saved.some((item) => item.id === "services"), false);
});

test("PUT /api/homepage returns 500 when persistence fails", async () => {
  Homepage.findOneAndUpdate = async () => {
    throw new Error("database unavailable");
  };

  const res = response();
  await saveHomepage(
    {
      user: { id: "507f1f77bcf86cd799439011" },
      body: { sections: [section()] },
    },
    res,
  );

  assert.equal(res.result.statusCode, 500);
  assert.equal(res.result.body.message, "Could not save homepage");
});

import Homepage from "../models/homepage.js";
import { homepageDefaults } from "../data/homepageDefaults.js";

const supportedTypes = new Set([
  "hero",
  "services",
  "discounts",
  "benefits",
  "testimonials",
  "cta",
  "custom",
]);

const limits = {
  id: 100,
  title: 200,
  eyebrow: 120,
  body: 10000,
  buttonText: 80,
  buttonUrl: 2048,
  imageUrl: 2048,
  background: 120,
};

const isStringWithin = (value, max) => typeof value === "string" && value.length <= max;
const isNullableStringWithin = (value, max) => value === null || value === undefined || isStringWithin(value, max);

const isSafeUrl = (value, allowExternal) => {
  if (value === null || value === undefined || value === "") return true;
  if (typeof value !== "string" || value.length > limits.buttonUrl) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return allowExternal && /^https:\/\//i.test(value);
};

const validateItems = (items, sectionIndex, errors) => {
  if (items === undefined) return [];
  if (items === null) {
    errors.push({ path: `sections[${sectionIndex}].items`, message: "items must be an array" });
    return [];
  }
  if (!Array.isArray(items)) {
    errors.push({ path: `sections[${sectionIndex}].items`, message: "items must be an array" });
    return [];
  }
  if (items.length > 100) {
    errors.push({ path: `sections[${sectionIndex}].items`, message: "items must contain at most 100 entries" });
  }

  return items.map((item, itemIndex) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push({
        path: `sections[${sectionIndex}].items[${itemIndex}]`,
        message: "item must be an object",
      });
      return null;
    }

    if (typeof item.title !== "string") {
      errors.push({
        path: `sections[${sectionIndex}].items[${itemIndex}].title`,
        message: "title must be a string",
      });
    }
    if (typeof item.description !== "string") {
      errors.push({
        path: `sections[${sectionIndex}].items[${itemIndex}].description`,
        message: "description must be a string",
      });
    }
    if (item.icon !== undefined && typeof item.icon !== "string") {
      errors.push({
        path: `sections[${sectionIndex}].items[${itemIndex}].icon`,
        message: "icon must be a string",
      });
    }

    return {
      title: item.title,
      description: item.description,
      ...(item.icon === undefined ? {} : { icon: item.icon }),
    };
  }).filter(Boolean);
};

const normalizeSections = (sections) => {
  const errors = [];
  if (!Array.isArray(sections)) {
    return { sections: [], errors: [{ path: "sections", message: "sections must be an array" }] };
  }
  if (sections.length > 50) {
    errors.push({ path: "sections", message: "sections must contain at most 50 entries" });
  }

  const ids = new Set();
  const normalized = sections.map((section, index) => {
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      errors.push({ path: `sections[${index}]`, message: "section must be an object" });
      return null;
    }

    const path = `sections[${index}]`;
    if (!isStringWithin(section.id, limits.id) || !/^[A-Za-z0-9_-]+$/.test(section.id || "")) {
      errors.push({ path: `${path}.id`, message: "id must contain 1-100 letters, numbers, underscores, or hyphens" });
    } else if (ids.has(section.id)) {
      errors.push({ path: `${path}.id`, message: "id must be unique" });
    } else {
      ids.add(section.id);
    }
    if (!supportedTypes.has(section.type)) {
      errors.push({ path: `${path}.type`, message: "type is not supported" });
    }
    if (typeof section.title !== "string" || section.title.trim().length === 0) {
      errors.push({ path: `${path}.title`, message: "title is required" });
    } else if (section.title.length > limits.title) {
      errors.push({ path: `${path}.title`, message: "title must be at most 200 characters" });
    }
    for (const [field, max] of [["eyebrow", limits.eyebrow], ["body", limits.body], ["buttonText", limits.buttonText]]) {
      if (!isNullableStringWithin(section[field], max)) {
        errors.push({ path: `${path}.${field}`, message: `${field} must be a string within its length limit` });
      }
    }
    if (section.enabled !== true && section.enabled !== false) {
      errors.push({ path: `${path}.enabled`, message: "enabled must be a boolean" });
    }
    if (!isSafeUrl(section.buttonUrl, true)) {
      errors.push({ path: `${path}.buttonUrl`, message: "buttonUrl must be an internal path or HTTPS URL" });
    }
    if (!isSafeUrl(section.imageUrl, true)) {
      errors.push({ path: `${path}.imageUrl`, message: "imageUrl must be an internal path or HTTPS URL" });
    }
    if (!isNullableStringWithin(section.background, limits.background) ||
        (section.background && !/^[A-Za-z0-9:_/-]+(?:\s+[A-Za-z0-9:_/-]+)*$/.test(section.background))) {
      errors.push({ path: `${path}.background`, message: "background contains unsupported characters" });
    }

    return {
      id: section.id,
      type: section.type,
      title: section.title,
      eyebrow: section.eyebrow ?? null,
      body: section.body ?? null,
      buttonText: section.buttonText ?? null,
      buttonUrl: section.buttonUrl ?? null,
      imageUrl: section.imageUrl ?? null,
      enabled: section.enabled,
      background: section.background ?? null,
      items: validateItems(section.items, index, errors),
      sortOrder: index,
    };
  }).filter(Boolean);

  return { sections: normalized, errors };
};

const publicSections = (homepage) => homepage.sections
  .slice()
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((section) => {
    const value = section.toObject ? section.toObject() : section;
    delete value._id;
    return value;
  });

const getOrSeedHomepage = async () => {
  let homepage = await Homepage.findOne({ key: "homepage" });
  if (!homepage) {
    homepage = await Homepage.create({
      key: "homepage",
      sections: homepageDefaults.map((section, sortOrder) => ({ ...section, sortOrder })),
    });
  }
  return homepage;
};

export const getHomepage = async (req, res) => {
  try {
    const homepage = await getOrSeedHomepage();
    res.json({ sections: publicSections(homepage) });
  } catch (error) {
    res.status(500).json({ message: "Could not load homepage", errors: [error.message] });
  }
};

export const saveHomepage = async (req, res) => {
  const result = normalizeSections(req.body?.sections);
  if (result.errors.length) {
    return res.status(400).json({
      message: result.errors.some((error) => error.path.endsWith(".items") || error.path.includes(".items["))
        ? "Invalid homepage section items"
        : "Invalid homepage payload",
      errors: result.errors,
    });
  }

  try {
    const homepage = await Homepage.findOneAndUpdate(
      { key: "homepage" },
      { $set: { sections: result.sections, updatedBy: req.user.id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json({
      message: "Homepage saved successfully",
      sections: publicSections(homepage),
    });
  } catch (error) {
    res.status(500).json({ message: "Could not save homepage", errors: [error.message] });
  }
};

# Homepage API

This API powers the public homepage and the admin homepage editor.

Base URL examples:

```text
http://localhost:5000
https://your-backend-domain.com
```

All routes below are prefixed with `/api`.

## 1. Read the homepage

```http
GET /api/homepage
```

This route is public. No authentication header is required.

### Successful response

```json
{
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "title": "Reliable HVAC & Cooling Solutions for Your Comfort",
      "eyebrow": "Licensed & Insured Professionals",
      "body": "Expert heating, cooling, and refrigeration services across Adelaide.",
      "buttonText": "Get a Quote",
      "buttonUrl": "/contact",
      "imageUrl": "/uploads/homepage/hero.jpg",
      "enabled": true,
      "background": null,
      "items": [],
      "sortOrder": 0
    }
  ]
}
```

The `sections` array is returned in display order. Render only sections where
`enabled` is `true`.

If no homepage has been saved yet, the backend creates and returns the default
homepage containing these sections:

1. `hero`
2. `services`
3. `discounts`
4. `benefits`
5. `testimonials`
6. `cta`

## 2. Save the complete homepage

```http
PUT /api/homepage
Content-Type: application/json
Authorization: Bearer <admin-token>
```

The save operation replaces the complete homepage configuration. Always send
the entire ordered `sections` array, not only the section that changed.

The admin token is returned by:

```http
POST /api/admin/login
```

The frontend stores this token as `aircool_admin_token`. Send it as a Bearer
token on every save request.

### Request example

```json
{
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "title": "Reliable HVAC & Cooling Solutions for Your Comfort",
      "eyebrow": "Licensed & Insured Professionals",
      "body": "Expert heating, cooling, and refrigeration services across Adelaide.",
      "buttonText": "Get a Quote",
      "buttonUrl": "/contact",
      "imageUrl": "/uploads/homepage/hero.jpg",
      "enabled": true,
      "background": null,
      "items": []
    },
    {
      "id": "custom-promo",
      "type": "custom",
      "title": "Summer Service Special",
      "eyebrow": "Limited offer",
      "body": "Book before 31 January and receive a free system health check.",
      "buttonText": "Contact us",
      "buttonUrl": "/contact",
      "imageUrl": null,
      "enabled": true,
      "background": "bg-secondary",
      "items": []
    }
  ]
}
```

### Successful response

```http
200 OK
```

```json
{
  "message": "Homepage saved successfully",
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "title": "Reliable HVAC & Cooling Solutions for Your Comfort",
      "eyebrow": "Licensed & Insured Professionals",
      "body": "Expert heating, cooling, and refrigeration services across Adelaide.",
      "buttonText": "Get a Quote",
      "buttonUrl": "/contact",
      "imageUrl": "/uploads/homepage/hero.jpg",
      "enabled": true,
      "background": null,
      "items": [],
      "sortOrder": 0
    }
  ]
}
```

The returned `sections` array is the persisted, normalized configuration. Use
it to update the admin editor after saving.

## Section fields

| Field | Required | Type | Limit / behavior |
|---|---:|---|---|
| `id` | Yes | string | 1–100 characters; letters, numbers, `_`, and `-`; unique per request |
| `type` | Yes | string | `hero`, `services`, `discounts`, `benefits`, `testimonials`, `cta`, or `custom` |
| `title` | Yes | string | 1–200 characters |
| `eyebrow` | No | string or `null` | Maximum 120 characters |
| `body` | No | string or `null` | Maximum 10,000 characters |
| `buttonText` | No | string or `null` | Maximum 80 characters |
| `buttonUrl` | No | string or `null` | Internal path or HTTPS URL |
| `imageUrl` | No | string or `null` | Internal path or HTTPS URL |
| `enabled` | Yes | boolean | `true` renders publicly; `false` hides the section |
| `background` | No | string or `null` | Theme/class value containing safe characters |
| `items` | No | array | Maximum 100 item objects |

The backend calculates `sortOrder` from the array position. To reorder
sections, send them in the desired order.

### Section item fields

Each item must be an object with a string `title` and string `description`.
`icon` is optional, but must be a string when supplied.

```json
{
  "items": [
    {
      "title": "Licensed & Insured",
      "description": "Fully certified technicians with complete insurance coverage.",
      "icon": "Shield"
    }
  ]
}
```

Supported benefit icons currently used by the frontend:

```text
Clock
Shield
ThumbsUp
Users
Zap
Award
```

## Frontend behavior examples

### Hide a section

Keep the section in the array and set:

```json
{
  "enabled": false
}
```

### Add a section

Add a valid section object to the `sections` array and save the complete
configuration.

### Delete a section

Remove the section object from the `sections` array and save the complete
configuration.

### Reorder sections

Change the array order and save:

```json
{
  "sections": [
    { "id": "hero", "type": "hero", "title": "Hero", "enabled": true },
    { "id": "cta", "type": "cta", "title": "Contact us", "enabled": true },
    { "id": "services", "type": "services", "title": "Services", "enabled": true }
  ]
}
```

## Axios example

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export async function getHomepage() {
  const response = await api.get("/api/homepage");
  return response.data.sections;
}

export async function saveHomepage(sections) {
  const token = localStorage.getItem("aircool_admin_token");

  const response = await api.put(
    "/api/homepage",
    { sections },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data.sections;
}
```

## Fetch example

```js
const token = localStorage.getItem("aircool_admin_token");

const response = await fetch(`${API_URL}/api/homepage`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ sections })
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.message || "Could not save homepage");
}
```

## Error responses

### Invalid payload: `400 Bad Request`

```json
{
  "message": "Invalid homepage payload",
  "errors": [
    {
      "path": "sections[0].title",
      "message": "title is required and must be at most 200 characters"
    }
  ]
}
```

For invalid items, the message is `Invalid homepage section items`:

```json
{
  "message": "Invalid homepage section items",
  "errors": [
    {
      "path": "sections[0].items[0].title",
      "message": "title must be a string"
    }
  ]
}
```

### Missing or invalid token: `401 Unauthorized`

```json
{
  "message": "Authentication required"
}
```

or:

```json
{
  "message": "Invalid or expired authentication token"
}
```

### Non-admin token: `403 Forbidden`

```json
{
  "message": "Administrator access required"
}
```

### Server or database failure: `500 Internal Server Error`

```json
{
  "message": "Could not save homepage",
  "errors": ["error details"]
}
```

The frontend should not show a successful save state unless the response
status is in the `2xx` range.

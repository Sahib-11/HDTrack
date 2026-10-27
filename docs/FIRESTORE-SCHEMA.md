# Firestore Schema

## Overview

All collections use the typed collection pattern — see `frontend/src/lib/firebase/firestore.ts`.
Security rules are in `firebase/firestore.rules`.

When adding a new collection, use the `/firebase-collection` Claude Code skill.

## Schema versioning

Every document in every collection **must** include a `_schemaVersion` field:

```typescript
_schemaVersion: 1  // increment when doing a breaking schema change
```

This enables **lazy migration** — when a document is read, check `_schemaVersion` and migrate on the fly if it's behind current. See the `/evolve-schema` skill for the full migration workflow.

**Rules:**
- `_schemaVersion` is always `1` on creation
- Non-breaking changes (adding optional fields with defaults) keep the same version
- Breaking changes (rename, remove, type change) increment the version and require a migration function
- Never remove `_schemaVersion` from a schema

---

## `users` collection

**Path:** `/users/{userId}`
**Access:** Owner-only (user can read/write their own document; admins can read all)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | Yes | Firebase Auth UID (same as document ID) |
| `email` | `string` | Yes | User's email address |
| `displayName` | `string \| null` | Yes | Display name from Auth or profile |
| `photoURL` | `string \| null` | Yes | Profile photo URL |
| `role` | `'user' \| 'admin'` | Yes | User role — immutable by user after creation |
| `createdAt` | `Timestamp` | Yes | When the document was created |
| `updatedAt` | `Timestamp` | Yes | When the document was last updated |
| `_schemaVersion` | `1` | Yes | Schema version for lazy migration |

**Creation:** Auto-created by `AuthProvider` on first sign-in via `syncUserProfile()`.
**Deletion:** Hard-delete is disabled in security rules. Use `deletedAt` field for soft-delete.

---

<!-- Add new collection schemas below using the /firebase-collection skill -->

---

## `pitStops` collection

**Path:** `/pitStops/{pitStopId}`
**Purpose:** Stores available Pit Stop locations.

**Access:** Authenticated users can read locations.
Writes are restricted to trusted server/admin operations.

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Pit Stop name |
| location | string | Yes | Location description |
| isActive | boolean | Yes | Whether the Pit Stop is active |
| _schemaVersion | number (1) | Yes | Schema version |

---

## `queueReports` collection

**Path:** `/queueReports/{reportId}`
**Purpose:** Stores queue reports submitted by fans.

**Access:**
- Authenticated users can read queue reports.
- Normal report submission uses the validated Next.js Server Action.
- Direct client creation is permitted only when Firestore
  security rules validate ownership, fields, timestamp,
  queue level and an active Pit Stop.
- Direct client updates and deletes are denied.

| Field | Type | Required | Description |
|---|---|---|---|
| pitStopId | string | Yes | Related Pit Stop document ID |
| uid | string | Yes | Reporting user's Firebase UID |
| level | string | Yes | short, moderate, or long |
| createdAt | Timestamp | Yes | Report creation timestamp |
| _schemaVersion | number (1) | Yes | Schema version |

**Relationship:**
A Pit Stop can have many queue reports.
Each queue report belongs to one Pit Stop.

**Notes:**
- Document IDs are stored as Firestore document IDs.
- The application will generate report timestamps.
- Access rules and server validation will be added
  during implementation.

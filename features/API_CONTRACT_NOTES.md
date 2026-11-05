# API Contract Notes — Ayar Admin New Features

This document records the conflicts found between the requirements document
(`features/ADMIN_PANEL_FRONTEND_CHANGES.md`, "Requirements" below) and the Postman
collection (`Ayar_Souq_Admin_APIs.postman_collection_new.json`, "Postman" below),
and how each was resolved for the frontend implementation.

> **Status: PROVISIONAL.** No Ayar backend source code is available in this
> workspace or on this machine (verified by a full disk search on 2026-10-17),
> and the Postman collection contains no saved example responses. Every decision
> below is based on Postman request bodies, descriptions, and test scripts only.
> None of these decisions has been verified against a live backend. Re-verify
> each item when backend source or a documented OpenAPI/schema becomes available.

---

## A. Ad attribute definitions

| Aspect | Requirements | Postman (adopted) |
|---|---|---|
| Type field | `inputType` | `data_type` |
| Type values | `select` / `text` / `number` | `select` / `number` / `text` / `boolean` |
| Unit | `unit` | `unit_ar`, `unit_en` |
| Extra fields | — | `code`, `min_value`, `max_value`, `decimal_places`, `depends_on_attribute_id` |

**Decision:** Send only the Postman fields. `inputType`/`unit` are never sent.
`code` is immutable after creation (update accepts partial fields; changing
`data_type` or `depends_on_attribute_id` can fail with 409 `ATTRIBUTE_HAS_VALUES`).
Evidence: Postman "Create Attribute" body and "Update Attribute" description.

## B. Option ordering

| Requirements | Postman (adopted) |
|---|---|
| `orderedOptionIds` | `optionIds` |

**Decision:** `POST /admin/ad-attributes/options/reorder` sends
`{ attributeId, optionIds }`. `orderedOptionIds` is never sent.

## C. Category-attribute mappings

| Requirements | Postman (adopted) |
|---|---|
| `subcategoryId` | `categoryId` |
| `isRequired`, `isFilterable` | `is_required`, `is_filterable` |
| — | `show_in_card`, `sort_order`, `is_active` |

**Decision:** All four mapping endpoints (`list`, `assign`, `update`, `unassign`)
use `{ categoryId, attributeId, is_required, is_filterable, show_in_card,
sort_order }` with snake_case booleans. CamelCase variants are never sent.
Constraints from Postman descriptions: subcategories only; text attributes
cannot be filterable; a dependent attribute requires its parent assigned first
(`PARENT_ATTRIBUTE_NOT_ASSIGNED`); unassigning a parent with dependents fails
with 409 `ATTRIBUTE_HAS_DEPENDENTS`; `is_required` defaults to false because it
depends on a Flutter release that sends attributes.

## D. Rejection / more-info reason codes

- **Identity (adopted from Postman):** `id_front_unreadable`, `id_back_unreadable`,
  `selfie_mismatch`, `selfie_unreadable`, `id_expired`, `id_not_uae`,
  `name_mismatch`, `photo_mismatch`, `document_tampered`, `policy_violation`, `other`.
  Requirements listed a smaller, different set (`info_mismatch` etc.) — not used.
- **Business (adopted from Postman):** `license_unreadable`, `license_expired`,
  `license_mismatch`, `authority_mismatch`, `name_mismatch`,
  `authorization_missing`, `authorization_unreadable`, `not_authorized_person`,
  `document_tampered`, `policy_violation`, `other`.
  Requirements used `authorization_invalid`, `info_mismatch` — not used.
- **missingItems (adopted from Postman):** identity `id_front`/`id_back`/`selfie`;
  business `license`/`authorization`/`legal_name`/`trade_name`/`address`.

## E. Business approval enums

| Aspect | Requirements | Postman (adopted) |
|---|---|---|
| authorityCode | `DED`, `ADDET`, `DMCC`, `JAFZA`, `DAFZA`, `DIFC`, `RAKEZ`, `OTHER_FREEZONE` | `DED_DUBAI`, `ADDED`, `SEDD_SHARJAH`, `DED_AJMAN`, `DED_UAQ`, `DED_RAK`, `DED_FUJAIRAH`, `DMCC`, `JAFZA`, `RAKEZ`, `OTHER_FREEZONE` |
| businessKind | `store` / `company` / `freelancer` | `store` / `company` |
| activityType | `gold_jewelry`, `gold_bullion`, `watches`, `diamonds`, `workshop`, `other` | `jewelry_store`, `bullion_trading`, `supplier`, `workshop`, `other` |

**Decision:** Postman values only. `authorityName` (name) is required when
`authorityCode === 'OTHER_FREEZONE'`.

## F. Business revocation effect

- Requirements: revoking business verification "stops all user ads automatically".
- Postman: account falls back to individual selling privileges; ads lose the
  business badge; the public business profile is degraded (trade name + logo
  only, `isBusinessVerified: false`). The license claim is kept.

**Decision:** The UI uses neutral confirmation copy about withdrawing business
verification and does NOT promise that ads stop. After a successful revoke the
client refetches the actual user/profile/ads state instead of assuming an
outcome. No client-side mass deactivation is performed.

## Identity revocation behavior (Postman, adopted)

- Revoke applies to `verified`/`expired` accounts, by `userId` (not `requestId`).
- The identity claim is KEPT — the same Emirates ID cannot be verified for
  another account afterwards; the user cannot self-serve a new request
  (`IDENTITY_REVOKED_CONTACT_SUPPORT`). UI copy reflects this; it does not imply
  the ID is released.
- Approve / requestMoreInfo / reject are pending-only actions.

## Response envelope (provisional)

- App endpoints: `{ status: 'success'|'error', message, data }` (matches the
  existing app convention and Postman test scripts).
- List payloads per Postman test scripts: categories → `data.categories`,
  posts → `data.posts`, users → `data.users`, identity/business requests →
  `data.requests`, each with `data.pagination`.
- Details: post → `data` (id, post_title, price_type, images, attributes,
  sellerType, accountType, …); identity/business request → `data.request`,
  `data.viewUrls` (documents with `url` + `expiresAt`, ~120 s), `data.events`,
  `data.possibleDuplicate`; business also `data.profile`, `data.identitySummary`.
- Field names inside nested objects (`request.*`, `profile.*`, `events[]`)
  are NOT documented anywhere — the UI reads them defensively and must be
  re-verified against live responses.

## Unresolved items requiring backend verification

1. Exact nested response shapes for `identity/getById`, `business/getById`,
   `users/getPublicProfile`, `users/getAccountPublicPage`,
   `business/getPublicProfile` (no example responses in the collection).
2. Whether `GET` endpoints exist for countries/states (see next section).
3. Category image deletion semantics (whether `image_storage_key: null` removes
   the image) — the frontend omits the field when unchanged and never sends
   null for deletion until confirmed.

---

## BLOCKER: Country / emirate lookups

Three features need real database IDs and no lookup endpoint exists in the
collection or in any accessible source:

1. `countryId` filter on `/admin/posts-ads/list`.
2. `countryID` (exact casing) on `/admin/users/getAccountPublicPage`.
3. `emirateStateIdConfirmed` on `/admin/business/approve`.

**What the frontend needs (request to backend team):**

- `GET|POST /api/countries` (or equivalent) → `[{ id, name_ar, name_en, code }]`
- `GET|POST /api/countries/:id/states` (or `/api/states?countryId=`) →
  `[{ id, countryId, name_ar, name_en }]`

**Frontend handling until then:** an isolated `LookupService`
(`src/app/shared/services/data/lookup.service.ts`) reports
`isAvailable = false`; the three affected controls render a clear blocked state
and no IDs are hardcoded. Business approval is disabled because
`emirateStateIdConfirmed` is required. All other features are unaffected.

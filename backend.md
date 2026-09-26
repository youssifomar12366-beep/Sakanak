# Backend Analysis and Proposed API Contract

> Documentation only. This file records the current Local Services, Types, and API infrastructure, then proposes routes for discussion. It does not define a final Swagger/OpenAPI contract. Anything not represented by the inspected code is marked **Needs Backend Decision**.

## Scope and Current Integration

The domain Services currently use `localStorage`, local utility functions, or placeholder implementations. They are not connected to a configured backend. The API infrastructure has `API_BASE_URL = ""`; when called, `apiClient` throws before making a request. Its request wrapper adds JSON content type, optionally adds `Authorization: Bearer <token>`, and unwraps a `{ data }` response when present. The available client methods are GET, POST, PATCH, PUT, and DELETE. There is no multipart upload support in the current client.

The proposed route names and HTTP methods below are recommendations for discussion, not existing endpoints. Proposed status codes and access rules must be agreed before OpenAPI is finalized.

## 1. Authentication

| Operation | Current local behavior | Proposed contract shape | Backend decision |
|---|---|---|---|
| Register | `registerUser(data)` creates a User, stores it, and saves it as the current user. `RegistrationData` has name, email, phone, password, role, and optional `collegeOrWork`. | `POST /api/auth/register`; request based on `RegistrationData`; response should return a safe user representation and session/token data. | Needs Backend Decision: role self-selection, registration verification, duplicate-email behavior, and response/session model. |
| Login | Email is compared case-insensitively; password is compared directly in local storage. | `POST /api/auth/login`; request `{ email, password }`; response should return a safe user and session/token data. | Needs Backend Decision: token/session strategy, throttling, lockout, and error behavior. |
| Logout | Removes `nest.currentUser` from local storage; no server session is invalidated. | `POST /api/auth/logout` if using revocable server sessions/refresh tokens; alternatively client-side token removal. | Needs Backend Decision: whether logout requires server-side revocation. |
| Current User | `getCurrentUser()` parses a saved local user. | `GET /api/auth/me`; response safe User. | Needs Backend Decision: behavior for expired or revoked credentials. |
| Token | `AuthToken` is a string; `AuthSession` contains `user` and optional `token`. | Bearer authorization is compatible with the current API client. | Needs Backend Decision: opaque token vs JWT, refresh-token design, storage, and claims. |
| Authorization header | API client sends `Authorization: Bearer <token>` when `nest.authToken` exists. | Keep Bearer scheme if approved. | Needs Backend Decision: token type and whether all protected routes use this scheme. |
| Expiration | Not represented. | Define access/refresh lifetime and renewal behavior. | Needs Backend Decision. |
| Forgot password | Returns false when the email is not in local users; stores a local reset flow. | `POST /api/auth/forgot-password`; request `{ email }`; return a generic accepted response. | Needs Backend Decision: email enumeration policy and delivery channel. |
| Verification code | Local code is fixed to `000000`; `VerificationCode` has `email`, `code`, optional `expiresAt`. | `POST /api/auth/verify-code`; request `{ email, verificationCode }`; response verification result/token if adopted. | Needs Backend Decision: delivery channel, expiration, attempt limits, and code lifecycle. |
| Reset password | Requires a locally verified flow; updates the user's stored password. `PasswordResetRequest` has email, optional verificationCode, and newPassword. | `POST /api/auth/reset-password`; request should use a verified reset credential and new password. | Needs Backend Decision: exact proof payload, password policy, invalidation of existing sessions. |

Passwords must never be returned in API responses. The local `User` Type currently has an optional `password` field and local authentication compares plain values; that local behavior must not be copied into a backend credential store.

## 2. Users

### Entity and fields

Current `User` fields: `id: string`, `name: string`, `email: string`, `phone?: string`, `collegeOrWork?: string`, `password?: string`, and `role`. `RegistrationData` requires `name`, `email`, `phone`, `password`, and `role`; `collegeOrWork` is optional. `AuthUser` in the auth service also includes these fields and optional password.

**Needs Backend Decision:** whether all registration fields remain required; email/phone verification; uniqueness and normalization rules; profile fields per role; and safe user response fields. Password should be accepted only in credential requests and excluded from every User response.

### Roles and permissions

Roles in the Types are `STUDENT`, `OWNER`, `BROKER`, and `ADMIN`. A generic `Permission` union exists (`booking:create`, `booking:manage`, `apartment:manage`, `user:manage`, `message:send`) but it is not mapped to roles or enforced in Services.

| Role | Evidence in current client | Proposed permissions to confirm |
|---|---|---|
| Student | Can submit a booking request and use favorites in client flows. | Read public/approved apartments; manage own favorites and bookings; view own notifications/messages. **Needs Backend Decision** for booking cancellation, edits, and access to contact data. |
| Owner | Can submit an apartment and see local bookings filtered by `ownerId`. | Create/manage only their own listings and decide requests for those listings. **Needs Backend Decision** for full CRUD, contact visibility, and authority over bookings. |
| Broker | The apartment form permits this role to submit listings; `publisherRole` records OWNER or BROKER. | **Needs Backend Decision:** whether a broker owns listings, represents another owner, and which records/fields they can manage. |
| Admin | The client dashboard reads users, apartments, and bookings; it can approve/reject/delete apartments, delete non-admin users, and send a message to a non-admin user. | Administrative access to defined records/actions. **Needs Backend Decision** for sensitive fields, audit access, and whether admin may alter bookings or roles. |

The role checks in the UI are not authorization. The backend must derive the actor from the authenticated session and enforce resource-level permissions on every route.

## 3. Apartments

### Current entity

`Apartment` contains `id`, optional `status`, `buildingNumber`, `floorNumber`, `city`, `area`, `district`, `address`, optional `fullLocation`, `images: string[]`, `price`, `rating`, `image`, `beds`, `rooms`, `amenities: string[]`, `allowedGender`, `publisherRole`, optional `ownerId`, `publisherName`, and `publisherPhone`.

### Operations and proposed routes

| Operation | Proposed route | Request / response outline | Access outline |
|---|---|---|---|
| Create | `POST /api/apartments` | Request: writable apartment fields, excluding server-owned ID/status/publisher identity. Response: created Apartment. | OWNER/BROKER candidate; server sets publisher identity and initial status. Exact rule: **Needs Backend Decision**. |
| Get list | `GET /api/apartments` | Query/filter/pagination shape: **Needs Backend Decision**. Response: Apartment list and optional pagination. | Public visibility and admin/owner scopes: **Needs Backend Decision**. |
| Get one | `GET /api/apartments/{apartmentId}` | Response: Apartment with only fields visible to the caller. | **Needs Backend Decision** for pending/rejected visibility and phone projection. |
| Update | `PATCH /api/apartments/{apartmentId}` | Request: allowed mutable fields; response: updated Apartment. | Owner/publisher and admin rules: **Needs Backend Decision**. Current local service has no general field-update operation. |
| Delete | `DELETE /api/apartments/{apartmentId}` | Response: deletion result or empty response. | Owner of resource/admin policy: **Needs Backend Decision**. |
| Approve/reject | `POST /api/admin/apartments/{apartmentId}/approve` and `/reject` (proposed) | Optional reason/audit data: **Needs Backend Decision**. Response: updated status. | ADMIN candidate; transition rules and audit record: **Needs Backend Decision**. |

Local creation sets status to `pending`; admin actions change it to `approved` or `rejected`. The local public-apartment utility filters out pending and rejected records. Amenities are strings validated locally against the IDs `wifi`, `air-conditioning`, `private-bathroom`, `security`, `natural-gas`, and `elevator`. This is not server validation.

Images are represented on Apartment as strings plus a primary `image` string. Their format is not defined; see Images and Needs Backend Decision.

## 4. Rooms & Beds

`Room` and `Bed` Types exist, but the current room service generates them from `Apartment.rooms` and `Apartment.beds`; it does not persist independent records. Generated rooms contain `number`, bed-number arrays, and optional status. Generated beds contain `number`, `roomNumber`, status, and optional `bookingId`.

Availability is derived from bookings. A pending, approved, or confirmed booking occupies matching inventory; rejected and cancelled bookings do not. An apartment booking occupies every generated bed; a room booking occupies beds in selected rooms; a bed booking occupies selected beds. Room status is available, partial, or reserved based on its beds.

Proposed read route: `GET /api/apartments/{apartmentId}/availability`, returning the current `Availability` shape (`apartmentId`, rooms, beds, overall status). Separate `GET /api/apartments/{apartmentId}/rooms` and `GET /api/rooms/{roomId}/beds` routes only make sense if Rooms/Beds become persistent entities.

**Needs Backend Decision:** whether Room and Bed are database entities; stable identifiers; room/bed counts and labels; whether a room or whole apartment booking can coexist with other active reservations; date-range availability; and whether availability is computed on demand or materialized.

## 5. Bookings

### Current shape and behavior

`Booking` contains `bookingId`, `apartmentId`, `apartmentTitle`, `ownerId`, optional `studentId`, `studentName`, `studentEmail`, `studentPhone`, and `collegeOrWork`, `bookingType`, `quantity`, optional selected room(s)/bed(s), `price`, optional `bookingDate`, `createdAt`, and `status`.

`bookingType` is `apartment | room | bed`. Room/bed selections are numbers (single and array fields are supported). `bookingDate` is an optional string; local formatting expects `YYYY-MM-DD`. `createdAt` is generated locally.

### Proposed operations

| Operation | Proposed route | Request / response outline | Access outline |
|---|---|---|---|
| Create | `POST /api/bookings` | Request: apartment, booking type, quantity, selected stable room/bed IDs if adopted, and booking date. Response: created Booking in pending status. Do not trust client-supplied student/owner identity, status, or price. | STUDENT candidate; server resolves actor and listing owner. Final rule: **Needs Backend Decision**. |
| List current user's bookings | `GET /api/bookings/mine` | Response: caller's bookings, pagination decision pending. | Authenticated user; exact role scope: **Needs Backend Decision**. |
| Get one | `GET /api/bookings/{bookingId}` | Response: only data visible to the caller. | Student who created it, associated owner, or admin candidate; confirm policy. |
| Owner list | `GET /api/owner/bookings` (or filtered `/api/bookings`) | Response: requests for caller-owned/managed apartments. | OWNER/BROKER candidate; resource ownership must be checked on server. |
| Approve | `POST /api/bookings/{bookingId}/approve` | Optional response body: updated Booking. | Associated owner candidate; admin authority: **Needs Backend Decision**. |
| Reject | `POST /api/bookings/{bookingId}/reject` | Optional reason: **Needs Backend Decision**. Response: updated Booking. | Associated owner candidate; admin authority: **Needs Backend Decision**. |
| Cancel | `POST /api/bookings/{bookingId}/cancel` | Optional cancellation reason: **Needs Backend Decision**. Response: updated Booking. | Who can cancel and the allowed time/status: **Needs Backend Decision**. |

The local owner UI changes `pending` directly to `confirmed` or `rejected`; the Types also include `approved`. The backend lifecycle must define whether `approved` and `confirmed` are distinct, all allowed transitions, terminal states, and who can perform each transition. Student/Owner/Admin permissions are not enforced in booking Services.

**Double booking and concurrency:** current availability reads local bookings and has no atomic reservation. The backend must check overlap and reserve inventory within a database transaction or equivalent atomic operation, with a uniqueness/locking strategy suitable for the chosen booking time model. Conflict response and retry behavior: **Needs Backend Decision**.

**Booking date:** decide whether it is a move-in date or a date range; the current Type only has one optional string and does not establish duration.

## 6. Favorites

Current local service stores apartment IDs grouped by user ID and supports add, remove, check, and list.

| Operation | Proposed route | Request / response | Access |
|---|---|---|---|
| Get | `GET /api/favorites` | Response: favorite Apartment IDs or Favorite records; choose one. | Authenticated caller only. |
| Add | `PUT /api/favorites/{apartmentId}` | No body required; response: Favorite or success. | Authenticated caller; user ID derived from session. |
| Remove | `DELETE /api/favorites/{apartmentId}` | Response: success/empty. | Authenticated caller; user ID derived from session. |

**Needs Backend Decision:** whether deleted/unavailable apartments remain in favorites and whether API returns IDs or expanded apartment summaries.

## 7. Notifications

Current `BookingNotification` includes notification ID, optional owner/student IDs, booking ID, title, optional student identity/contact fields, apartment title, booking type/selection, price, optional booking date, created time, status, and optional `read`. Existing operations create, get, mark read, and delete. Local marking/deletion accepts an ID without validating the acting user's ownership.

| Operation | Proposed route | Request / response | Access |
|---|---|---|---|
| Create | Internal event on booking create/status change; optionally `POST /api/notifications` for authorized system/admin use. | Request derived from booking event; response Notification. | Prefer server-created event; direct role access: **Needs Backend Decision**. |
| Get | `GET /api/notifications` | Response: notifications addressed to caller. | Authenticated caller only. |
| Mark read | `PATCH /api/notifications/{notificationId}/read` | No body; response updated notification or success. | Recipient only. |
| Delete | `DELETE /api/notifications/{notificationId}` | Response success/empty. | Recipient/admin policy: **Needs Backend Decision**. |

**Needs Backend Decision:** notification types, delivery channels, recipient rules, retention, and whether deleting a notification deletes only the notification or affects its booking (recommended: it must not mutate the booking).

## 8. Messages

The current local `AdminMessage` shape is `messageId`, `userId`, `message`, `createdAt`. The UI supports Admin sending to a non-admin user, including Student, Owner, or Broker. There is no sender field or `read` field in the current message Type. Local helpers exist to list by user, mark read, and delete by message ID.

| Operation | Proposed route | Request / response | Access |
|---|---|---|---|
| Admin send | `POST /api/admin/messages` | Request `{ recipientId, message }`; response Message. | ADMIN; recipient role may be STUDENT/OWNER/BROKER. |
| Get | `GET /api/messages` | Response: messages belonging to caller. | Authenticated caller only. |
| Mark read | `PATCH /api/messages/{messageId}/read` | No body; response updated Message or success. | Recipient only. |
| Delete | `DELETE /api/messages/{messageId}` | Response success/empty. | Recipient/admin policy: **Needs Backend Decision**. |

These methods are proposals. **Needs Backend Decision:** whether messages are admin-to-user only or conversations, whether sender metadata and read state are persisted, and delete/retention rules.

## 9. Images

Current `ImageUpload` is `{ name, type, data }`; `uploadImage` returns the input unchanged and `deleteImage` always returns false. Apartment image fields are strings. No current implementation defines URL format, file bytes encoding, storage, authorization, or multipart upload.

| Operation | Proposed route | Request / response | Access |
|---|---|---|---|
| Upload | `POST /api/images` | Candidate: `multipart/form-data` file; response image ID and URL/metadata. | Authenticated OWNER/BROKER or authorized admin; association/ownership check required. Exact policy: **Needs Backend Decision**. |
| Get | `GET /api/images/{imageId}` or returned storage URL | Response image bytes or redirect/URL. | Public/private access policy: **Needs Backend Decision**. |
| Delete | `DELETE /api/images/{imageId}` | Response success/empty. | Uploader/resource owner/admin policy: **Needs Backend Decision**. |

The current `apiClient` always sets JSON content type and serializes POST/PATCH/PUT bodies as JSON. It is not suitable for multipart as written. **Needs Backend Decision:** multipart versus direct-to-storage signed upload, storage provider, size/type validation, transformations, access control, URL lifetime, and deletion semantics.

## 10. Privacy & Security

1. **Student phone:** the UI displays `studentPhone` to the owner only for an approved/confirmed booking, but the booking and the pending owner notification currently contain the phone field. The backend must omit/mask it from owner-facing pending responses and reveal it only after the agreed acceptance state.
2. **Owner phone:** `publisherPhone` is part of Apartment and can be included in public apartment data. Backend responses must suppress it for students until the agreed accepted-booking state. The exact relationship between broker and owner phone visibility is **Needs Backend Decision**.
3. **Admin visibility:** define which administrative fields Admin can read, including contact details and account status. Do not assume all fields should be exposed merely because the local dashboard reads complete local records.
4. **Backend authorization:** enforce authentication, role checks, record ownership, and allowed state transitions at the API/database boundary. Frontend route guards and hidden controls are not security controls.
5. **IDs and mass assignment:** derive acting user IDs from the authenticated principal. Do not trust client-supplied `studentId`, `ownerId`, publisher identity, role, status, price, booking ID ownership, or notification/message recipient ownership. Allowlist writable fields per operation.
6. **Validation:** validate required fields, types, lengths, ranges, enums, referenced records, ownership, image metadata, booking selections, and state transitions on every request. Recalculate price and availability server-side where applicable.
7. **Credentials:** never return passwords. Use an approved password hashing strategy; the exact algorithm/configuration is **Needs Backend Decision**.
8. **Errors:** API infrastructure recognizes an error message, optional details, and status. The exact error schema and HTTP status map are **Needs Backend Decision**. Proposed categories appear in API Routes.
9. **Concurrency:** booking conflict checking and reservation must be atomic; a UI-side availability check is not sufficient.

## 11. Database Entities and Relationships

The following is a proposed relational mapping of existing Types and local relationships. Persistent Room, Bed, and Image rows are conditional choices, not facts about the current app.

| Entity | Key fields / relationships | Notes |
|---|---|---|
| Users | `id` PK; name, email, phone, college/work, role; password hash in credentials storage | Current User Type includes optional password; never expose it. Email uniqueness rule: **Needs Backend Decision**. |
| Apartments | `id` PK; `owner_id` FK to Users; location, price, counts, amenities, status, publisher role | Current `ownerId` is optional and used as publisher identity even for Broker. Ownership model: **Needs Backend Decision**. |
| Rooms | If adopted: `id` PK; `apartment_id` FK to Apartments | Current service generates numbered rooms; no persisted entity. |
| Beds | If adopted: `id` PK; `room_id` FK to Rooms | Current service generates numbered beds. Stable identity recommended if individually bookable. |
| Bookings | `id` PK; `apartment_id` FK; `student_id` and `owner_id` FKs to Users; optional room/bed FKs if entities adopted | Current booking copies names/contact/title/price. Decide snapshots vs joins and retention. |
| Favorites | `user_id` FK to Users; `apartment_id` FK to Apartments | Composite unique key `(user_id, apartment_id)` is a proposed duplicate-prevention constraint. |
| Notifications | `id` PK; `booking_id` FK to Bookings; recipient user FK(s) | Current record allows optional owner/student IDs; choose one normalized recipient relation or explicit recipient fields. |
| Messages | `id` PK; current `user_id` represents recipient; proposed `sender_id` FK to Users | Sender is absent from current Type. Direction/conversation model: **Needs Backend Decision**. |
| Images | If adopted: `id` PK; `apartment_id` FK to Apartments; storage key/URL and metadata | Current Apartment has strings and upload type has name/type/data; storage strategy unresolved. |

`Availability` is derived from apartments and active bookings in the current service and need not be a persisted table. Whether to materialize it is **Needs Backend Decision**.

Deletion policy (cascade, restrict, or soft delete), FK nullability, audit fields, and indexes are **Needs Backend Decision**. Booking indexes/constraints must support the agreed no-double-booking rule.

## 12. Proposed API Routes

### Conventions

- Success envelope may be `{ "data": ... , "message"?: "..." }`, matching the shape understood by `apiClient`; the envelope is a proposal, not a current server contract.
- The current `Pagination` Type is `{ page, pageSize, total }`. Which endpoints paginate and exact query parameters are **Needs Backend Decision**.
- Proposed common error body: `{ "message": string, "code"?: string, "details"?: unknown }`, matching the existing API error Types. Exact shape and HTTP status codes are **Needs Backend Decision**.
- Candidate error categories: validation (400/422), unauthenticated (401), forbidden (403), not found (404), conflict such as booking unavailable (409), and unexpected server error (500). These codes are suggestions only and require backend agreement.
- “Auth” below means a valid authenticated identity. Role labels are proposed access boundaries, not implemented authorizations.

| Method and route | Request → response | Authentication / proposed role | Candidate errors |
|---|---|---|---|
| `POST /api/auth/register` | `RegistrationData` → safe User + session | Public | validation, duplicate email, registration policy; exact codes **Needs Backend Decision** |
| `POST /api/auth/login` | `{ email, password }` → safe User + session | Public | invalid credentials, throttling; exact codes **Needs Backend Decision** |
| `POST /api/auth/logout` | optional session/revoke data → success | Auth if server revocation is used | unauthorized, revocation failure; **Needs Backend Decision** |
| `GET /api/auth/me` | none → safe User/session info | Auth | unauthorized |
| `POST /api/auth/forgot-password` | `{ email }` → generic accepted response | Public | validation/rate limit; do not reveal account existence |
| `POST /api/auth/verify-code` | `{ email, verificationCode }` → verification result | Public or reset-flow credential; **Needs Backend Decision** | invalid/expired/limited code |
| `POST /api/auth/reset-password` | reset proof + `{ newPassword }` → success | Public with valid reset proof | invalid/expired proof, password validation |
| `GET /api/users/me` | none → safe User | Auth | unauthorized |
| `PATCH /api/users/me` | allowlisted profile fields → safe User | Auth | validation, unauthorized |
| `GET /api/users/{userId}` | none → allowed User projection | Admin or self, subject to policy | unauthorized, forbidden, not found |
| `GET /api/admin/users` | filters/pagination TBD → User list | Admin | unauthorized, forbidden |
| `DELETE /api/admin/users/{userId}` | none → success/result | Admin | unauthorized, forbidden, not found, delete constraint |
| `GET /api/apartments` | filters/pagination TBD → Apartment list | Public approved-only visibility TBD | validation |
| `POST /api/apartments` | writable Apartment fields → created Apartment | Owner/Broker candidate | unauthorized, forbidden, validation |
| `GET /api/apartments/{apartmentId}` | none → caller-filtered Apartment | Public visibility TBD | not found, validation |
| `PATCH /api/apartments/{apartmentId}` | allowlisted fields → updated Apartment | Publisher/Admin candidate | unauthorized, forbidden, validation, not found |
| `DELETE /api/apartments/{apartmentId}` | none → success/result | Publisher/Admin candidate | unauthorized, forbidden, not found, delete constraint |
| `POST /api/admin/apartments/{apartmentId}/approve` | optional decision fields TBD → Apartment | Admin | unauthorized, forbidden, invalid transition, not found |
| `POST /api/admin/apartments/{apartmentId}/reject` | optional reason TBD → Apartment | Admin | unauthorized, forbidden, invalid transition, not found |
| `GET /api/apartments/{apartmentId}/availability` | optional date/date range TBD → Availability | Public/auth policy TBD | not found, validation |
| `GET /api/apartments/{apartmentId}/rooms` | none → Room list | Public/auth policy TBD; only if Rooms persist | not found |
| `GET /api/rooms/{roomId}/beds` | none → Bed list | Public/auth policy TBD; only if entities persist | not found |
| `POST /api/bookings` | booking selection/date → Booking (server sets actor, owner, price/status) | Student candidate | unauthorized, forbidden, validation, unavailable/conflict |
| `GET /api/bookings/mine` | filters/pagination TBD → caller's Booking list | Auth | unauthorized |
| `GET /api/bookings/{bookingId}` | none → caller-filtered Booking | Student/associated owner/Admin candidate | unauthorized, forbidden, not found |
| `GET /api/owner/bookings` | filters/pagination TBD → associated bookings | Owner/Broker candidate | unauthorized, forbidden |
| `POST /api/bookings/{bookingId}/approve` | optional decision fields TBD → Booking | Associated Owner candidate | unauthorized, forbidden, invalid transition, not found, conflict |
| `POST /api/bookings/{bookingId}/reject` | optional reason TBD → Booking | Associated Owner candidate | unauthorized, forbidden, invalid transition, not found |
| `POST /api/bookings/{bookingId}/cancel` | optional reason TBD → Booking | Student/Owner/Admin policy TBD | unauthorized, forbidden, invalid transition, not found |
| `GET /api/favorites` | none → Favorite list or apartment IDs | Auth | unauthorized |
| `PUT /api/favorites/{apartmentId}` | none → Favorite/success | Auth; user ID from session | unauthorized, not found |
| `DELETE /api/favorites/{apartmentId}` | none → success | Auth; user ID from session | unauthorized |
| `GET /api/notifications` | filters/pagination TBD → caller's notifications | Auth | unauthorized |
| `POST /api/notifications` | notification data → Notification; preferably internal event | Admin/system only if public endpoint is needed | unauthorized, forbidden, validation |
| `PATCH /api/notifications/{notificationId}/read` | none → updated notification/success | Recipient | unauthorized, forbidden, not found |
| `DELETE /api/notifications/{notificationId}` | none → success | Recipient/Admin policy TBD | unauthorized, forbidden, not found |
| `POST /api/admin/messages` | `{ recipientId, message }` → Message | Admin | unauthorized, forbidden, validation, recipient not found |
| `GET /api/messages` | filters/pagination TBD → caller's messages | Auth | unauthorized |
| `PATCH /api/messages/{messageId}/read` | none → updated message/success | Recipient | unauthorized, forbidden, not found |
| `DELETE /api/messages/{messageId}` | none → success | Recipient/Admin policy TBD | unauthorized, forbidden, not found |
| `POST /api/images` | multipart file or approved alternative → image ID/URL/metadata | Auth; Owner/Broker/Admin policy TBD | unauthorized, forbidden, validation, size/type error |
| `GET /api/images/{imageId}` | none → bytes/redirect/metadata per storage choice | Public/private policy TBD | unauthorized, forbidden, not found |
| `DELETE /api/images/{imageId}` | none → success | Resource owner/Admin policy TBD | unauthorized, forbidden, not found |

Routes for user administration, separate rooms/beds, notification creation, and booking decision verbs depend on decisions and can change before the final contract.

## 13. Statuses

These are the status strings currently declared in `constants/statuses.ts`:

| Domain | Statuses | Current meaning/use |
|---|---|---|
| Booking | `pending`, `approved`, `confirmed`, `rejected`, `cancelled` | New local booking is pending. Owner UI changes pending to confirmed or rejected. Availability excludes rejected/cancelled; other statuses occupy inventory. `approved` and `confirmed` both count as approved by the helper. Exact lifecycle: **Needs Backend Decision**. |
| Apartment | `pending`, `approved`, `rejected` | New owner/broker listing is pending; admin local actions approve/reject; public list excludes pending/rejected. Missing status on local seeded apartments is treated as approved. |
| Bed | `available`, `reserved` | Derived from matching non-rejected/non-cancelled bookings. |
| Room | `available`, `partial`, `reserved` | Derived from the number of available/reserved beds. |
| Availability | `available`, `reserved` | Overall apartment availability is reserved only when every derived bed is reserved. |

Notification `read` is a boolean rather than a declared status. Message read state is not represented in the current `AdminMessage` Type.

## 14. Service Mapping

The following maps existing exported functions to candidate endpoints or backend responsibilities. It does not imply current network calls.

| Current service/function(s) | Current local behavior | Proposed API mapping |
|---|---|---|
| `authService`: `loginUser`, `authenticateUser` | Local email/password lookup | `POST /api/auth/login` |
| `authService`: `registerUser` | Creates local User with generated ID | `POST /api/auth/register` |
| `authService`: `getCurrentUser` | Reads saved local user | `GET /api/auth/me` |
| `authService`: `saveCurrentUser` | Saves current user locally | Client session handling; no standalone endpoint necessarily |
| `authService`: `logoutUser` | Removes local current user | `POST /api/auth/logout` only if server revocation is adopted; also clear client session |
| `authService`: `validatePassword` | Checks for non-empty trimmed password | Server-side validation in register/reset; exact policy **Needs Backend Decision** |
| `authService`: `requestPasswordReset` | Local account lookup and reset-flow creation | `POST /api/auth/forgot-password` |
| `authService`: `verifyPasswordResetCode` | Compares fixed local code and marks flow verified | `POST /api/auth/verify-code` |
| `authService`: `resetPassword` | Updates local password after verified flow | `POST /api/auth/reset-password` |
| `userService`: `getUsers`, `getUserById` | Reads local users | `GET /api/admin/users`, `GET /api/users/{userId}` or `/me`, subject to authorization |
| `userService`: `createUser` | Stores/replaces local user by email | `POST /api/auth/register` or an Admin user route if needed |
| `userService`: `updateUser` | Updates arbitrary local user fields by ID | `PATCH /api/users/me`; admin-specific route only if approved |
| `userService`: `deleteUser` | Deletes local user by ID | `DELETE /api/admin/users/{userId}` subject to policy |
| `apartmentService`: `getApartments`, `getAllApartments`, `getApartmentById`, `getPublicApartments`, `readStoredApartments` | Local reads/filtering | `GET /api/apartments`, `/api/apartments/{id}`; public/admin filtering must be server-enforced |
| `apartmentService`: `createApartment` (`saveApartment`) | Stores local apartment | `POST /api/apartments` |
| `apartmentService`: `updateApartment`, `updateApartmentStatus`, `approveApartment`, `rejectApartment` | Changes local status; general update alias currently maps to status update | `PATCH /api/apartments/{id}` for approved editable fields; admin decision routes for status |
| `apartmentService`: `deleteApartment`, `deleteApartmentAsAdmin` | Local owner-ID check or admin deletion | `DELETE /api/apartments/{id}` with server-side resource authorization |
| `bookingService`: `createBooking` | Creates local booking and timestamp | `POST /api/bookings`; server must set identity/status and validate availability |
| `bookingService`: `getBookings`, `getBookingById`, `getStudentBookings`, `getOwnerBookings`, `getApartmentBookings` | Local list/filter by supplied IDs | `GET /api/bookings/mine`, `/api/bookings/{id}`, owner-scoped list, or apartment booking list; exact route policy TBD |
| `bookingService`: `updateBooking`, `approveBooking`, `rejectBooking`, `cancelBooking` | Local status mutation | Dedicated decision/cancel routes; state transition and permissions **Needs Backend Decision** |
| `bookingService`: `createBookingNotification` | Creates local notification | Prefer internal notification event triggered by booking operations; direct route only if agreed |
| `bookingService`: `formatBookingDate`, `isBookingApproved` | Formatting/status helper | Client utility; backend must define canonical date/status semantics |
| `favoriteService`: `getUserFavorites`, `isFavorite`, `addFavorite`, `removeFavorite` | Local IDs grouped by user ID | `GET /api/favorites`, `PUT /api/favorites/{apartmentId}`, `DELETE /api/favorites/{apartmentId}` |
| `notificationService`: `getUserNotifications`, `getOwnerNotifications`, `getStudentNotifications`, `createNotification` | Local filtering/creation | `GET /api/notifications`; server-generated notification events or authorized create route |
| `notificationService`: `markAsRead`, `deleteNotification` | Mutates local notification by ID | `PATCH /api/notifications/{id}/read`, `DELETE /api/notifications/{id}` with recipient ownership check |
| `messageService`: `sendMessage`, `createAdminMessage` | Creates local admin-to-user message | `POST /api/admin/messages` |
| `messageService`: `getUserMessages`, `getAdminMessages` | Local messages filtered by user ID | `GET /api/messages` for authenticated recipient |
| `messageService`: `markMessageAsRead`, `deleteMessage` | Local mutation by message ID | `PATCH /api/messages/{id}/read`, `DELETE /api/messages/{id}` with authorization |
| `imageService`: `uploadImage`, `deleteImage` | Identity placeholder / always false | `POST /api/images`, `DELETE /api/images/{id}` after upload/storage decision |
| `roomService`: `getApartmentRooms`, `getApartmentBeds` | Generates room/bed numbers from Apartment counts | Availability response or room/bed reads only if persistent entities are approved |
| `availabilityService`: `getApartmentAvailability`, `getBedStatus`, `getRoomStatus` | Derives occupied state from local bookings | `GET /api/apartments/{id}/availability`; booking decisions must use same authoritative server logic |
| API infrastructure: `apiClient.get/post/patch/put/delete` | Generic JSON fetch client; base URL empty; Bearer token optional | Can be wired to agreed endpoints; multipart support and error contract need a separate decision before image upload |

## 15. Needs Backend Decision

Resolve these items before approving the final Swagger/OpenAPI contract:

1. Token strategy, token type, storage, revocation, expiration, refresh, and logout behavior.
2. Registration role policy, required user fields, verification requirements, uniqueness, and safe user response shape.
3. Password hashing/policy, reset delivery mechanism, code lifetime, retry limits, and anti-enumeration response.
4. Exact permission matrix for Student, Owner, Broker, and Admin, including per-resource ownership checks.
5. Whether Brokers own listings or act for another Owner, and the authoritative apartment publisher/owner relationship.
6. Apartment create/update/delete rules, allowed fields, approval lifecycle, audit data, public visibility, and rejection reasons.
7. Whether Rooms/Beds are persistent entities or remain counts; stable IDs, availability periods, and room/bed/apartment booking compatibility.
8. Booking lifecycle: whether `approved` and `confirmed` are distinct, allowed transitions, who can approve/reject/cancel, and whether Admin participates.
9. Booking date semantics (single move-in date versus start/end period), price calculation, and cancellation effects.
10. Atomic double-booking prevention, conflict response, transaction/locking strategy, and retry behavior.
11. Exact phone/contact disclosure state and caller projections for Student, Owner, Broker, and Admin. Pending owner notifications must not reveal student phone if policy prohibits it.
12. Favorites response shape, behavior for unavailable/deleted apartments, and duplicate constraint.
13. Notification event types, recipient model, delivery channels, retention, and delete behavior.
14. Message direction (admin-only versus conversations), sender field, read state, delete policy, and retention.
15. Image upload protocol (multipart or direct-to-storage), provider, size/type limits, URL access, metadata, and deletion behavior.
16. Database FK nullability, cascade/restrict/soft delete, snapshots versus joins, indexes, and audit columns.
17. Request validation rules, pagination/filter conventions, API response envelope, error schema, and exact HTTP status codes.
18. Whether availability is computed at read time or materialized, while keeping booking creation authoritative and atomic.

## 16. Final API Summary

### Endpoint summary

| Area | Candidate endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/verify-code`, `POST /api/auth/reset-password` |
| Users | `GET /api/users/me`, `PATCH /api/users/me`, `GET /api/users/{userId}`, `GET /api/admin/users`, `DELETE /api/admin/users/{userId}` |
| Apartments | `GET /api/apartments`, `POST /api/apartments`, `GET /api/apartments/{apartmentId}`, `PATCH /api/apartments/{apartmentId}`, `DELETE /api/apartments/{apartmentId}`, `POST /api/admin/apartments/{apartmentId}/approve`, `POST /api/admin/apartments/{apartmentId}/reject` |
| Rooms/Beds/Availability | `GET /api/apartments/{apartmentId}/availability`; conditional room/bed reads if they become persistent entities |
| Bookings | `POST /api/bookings`, `GET /api/bookings/mine`, `GET /api/bookings/{bookingId}`, `GET /api/owner/bookings`, `POST /api/bookings/{bookingId}/approve`, `POST /api/bookings/{bookingId}/reject`, `POST /api/bookings/{bookingId}/cancel` |
| Favorites | `GET /api/favorites`, `PUT /api/favorites/{apartmentId}`, `DELETE /api/favorites/{apartmentId}` |
| Notifications | `GET /api/notifications`, optional authorized/internal create, `PATCH /api/notifications/{notificationId}/read`, `DELETE /api/notifications/{notificationId}` |
| Messages | `POST /api/admin/messages`, `GET /api/messages`, `PATCH /api/messages/{messageId}/read`, `DELETE /api/messages/{messageId}` |
| Images | `POST /api/images`, `GET /api/images/{imageId}` or storage URL, `DELETE /api/images/{imageId}` |

All listed routes are candidates. Request/response shapes, auth scope, and error codes are subject to the decisions above.

### Entity summary

| Entity | Relationship summary |
|---|---|
| Users | Referenced by Apartments, Bookings, Favorites, Notifications, and Messages. |
| Apartments | Publisher/owner FK to Users; parent of optional Rooms and Images; referenced by Bookings and Favorites. |
| Rooms | Conditional entity; FK to Apartments; parent of optional Beds. |
| Beds | Conditional entity; FK to Rooms; referenced by bed-level Bookings if adopted. |
| Bookings | FK to Apartment, Student User, and Owner/Publisher User; optional Room/Bed references. |
| Favorites | Join between User and Apartment; candidate unique pair. |
| Notifications | FK to Booking and recipient User(s). |
| Messages | FK to recipient User; sender FK is a proposed addition requiring a decision. |
| Images | Conditional entity; FK to Apartment and storage metadata. |

### Roles and permissions summary

| Role | Current client evidence | Backend permission summary |
|---|---|---|
| Student | Booking and favorites flows | Public listing access and own records are candidates; exact scope **Needs Backend Decision**. |
| Owner | Listing creation and owner-filtered booking display | Own listing/request management candidate; enforce server-side ownership. Exact scope **Needs Backend Decision**. |
| Broker | Listing creation and publisher role | Relationship to legal owner and management scope **Needs Backend Decision**. |
| Admin | Local user/listing/booking views, listing decisions, user deletion, admin messaging | Admin actions/field visibility **Needs Backend Decision** and must be audited as agreed. |

### Status summary

| Domain | Values |
|---|---|
| Booking | `pending`, `approved`, `confirmed`, `rejected`, `cancelled` |
| Apartment | `pending`, `approved`, `rejected` |
| Bed | `available`, `reserved` |
| Room | `available`, `partial`, `reserved` |
| Availability | `available`, `reserved` |

### Security requirements summary

| Requirement | Backend rule |
|---|---|
| Role and ownership authorization | Enforce on every request; never rely on client guards. |
| Caller identity and IDs | Derive actor from credentials; verify resource ownership; do not trust mutable IDs/role/status from client. |
| Contact privacy | Omit student/owner phone from responses until the agreed accepted booking state. |
| Validation | Validate every request, relationship, state transition, and booking selection on the server. |
| Credentials | Hash passwords; never return them. |
| Booking concurrency | Atomically validate and reserve inventory; return an agreed conflict response on collision. |
| Administrative access | Restrict and define sensitive fields/actions; audit consequential changes as agreed. |

### Decision summary

| Decision group | State |
|---|---|
| Tokens and expiration | **Needs Backend Decision** |
| Role matrix and Broker ownership model | **Needs Backend Decision** |
| Apartment editing and approval lifecycle | **Needs Backend Decision** |
| Booking status lifecycle and date model | **Needs Backend Decision** |
| Room/Bed entities and atomic reservation | **Needs Backend Decision** |
| Phone disclosure and Admin field visibility | **Needs Backend Decision** |
| Password reset verification mechanism | **Needs Backend Decision** |
| Image upload/storage strategy | **Needs Backend Decision** |
| Message and notification semantics | **Needs Backend Decision** |
| Database deletion/FK policy | **Needs Backend Decision** |
| Validation, pagination, response/error schema | **Needs Backend Decision** |
# Dashboard Submissions Feature – Change Log

## 1. Files Modified

| File | Change |
|------|--------|
| `server/controllers/submission.controller.js` | Added `getMySubmissions` and `getSubmissionById`. |
| `server/routes/submission.routes.js` | Registered `GET /my` and `GET /by-id/:id` (before `/:problemId`). |
| `client/app/dashboard/page.tsx` | Added “Submissions” link and `Link` import. |
| `client/app/problems/[id]/page.tsx` | Read `submissionId` from URL; when present and user logged in, call submission API and set editor code/language; avoid overwriting when loading a submission. |

## 2. Files Added

| File | Purpose |
|------|---------|
| `client/app/dashboard/submissions/page.tsx` | Dashboard Submissions page: table of user submissions, row click → problem page with `submissionId`. |

## 3. APIs Added

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/submissions/my` | JWT | Returns all submissions of the logged-in user (see response shape below). |
| GET | `/api/submissions/by-id/:id` | JWT | Returns one submission by `id` if it belongs to the user (for loading code on problem page). |

**GET /api/submissions/my** response (array of):

- `_id`, `problemId`, `problemTitle`, `language`, `status`, `createdAt`, `code`

**GET /api/submissions/by-id/:id** response:

- `_id`, `problemId`, `language`, `status`, `createdAt`, `code`

## 4. Database Fields Used

**Collection: submissions (existing `Submission` model)**

- `userId` – filter by JWT user.
- `problemId` – populated for `title` in `/my`.
- `title` (from Problem) – as `problemTitle` in `/my`.
- `language`, `status`, `createdAt`, `code` – returned as specified.
- No new fields or collections.

## 5. Flow (Frontend → Backend → Database → Back)

1. **User opens Submissions**
   - User clicks “Submissions” on Dashboard (or goes to `/dashboard/submissions`).
   - Frontend: `GET /api/submissions/my` with JWT.
   - Backend: `getMySubmissions` reads `userId` from JWT, queries `Submission.find({ userId }).populate('problemId','title').sort({ createdAt: -1 })`, maps to `{ _id, problemId, problemTitle, language, status, createdAt, code }`.
   - DB: read from `submissions` + `problems` (for title).
   - Response: list of submissions → UI renders table (Problem Title, Language, Status, Submitted At), latest first.

2. **User clicks a row**
   - Frontend: `router.push('/problems/:problemId?submissionId=XXXX')`.
   - User lands on problem page with `submissionId` in query.

3. **Problem page with submissionId**
   - Frontend: if `submissionId` and user exist, `GET /api/submissions/by-id/:submissionId` with JWT.
   - Backend: `getSubmissionById` checks `Submission.findOne({ _id: id, userId })`, returns `{ _id, problemId, language, status, createdAt, code }`.
   - DB: read one document from `submissions`.
   - Response: submission → frontend sets editor `code` and `language` from response; normal problem solving (run/submit) unchanged.

**End-to-end:**  
User clicks Submissions → API `/submissions/my` → DB → Response → UI table → User clicks row → Navigate to `/problems/:problemId?submissionId=XXXX` → Problem page → API `/submissions/by-id/:id` → DB → Response → Editor loads code.

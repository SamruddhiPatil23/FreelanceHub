# FreelanceHub — Testing Checklist

Import `backend/postman/FreelanceHub.postman_collection.json` into Postman before
starting. Run the four "Register" requests in the Auth folder first — they
auto-save tokens into collection variables, which every other request reuses.

## 1. Authentication

- [ ] Register as client — succeeds, returns token
- [ ] Register as freelancer — succeeds, returns token
- [ ] Register as admin — succeeds, returns token
- [ ] Register with an already-used email — fails with a clear error
- [ ] Register with a password under 6 characters — frontend blocks it before submit
- [ ] Login with correct credentials — succeeds
- [ ] Login with wrong password — fails with "Invalid email or password"
- [ ] Access GET /api/users/me with no token — 401 Unauthorized
- [ ] Access GET /api/users/me with a valid token — returns the correct user
- [ ] Log out on the frontend — token cleared, redirected to login, protected pages inaccessible

## 2. Profile Module

- [ ] Client can set Company Name; field does not appear for freelancers
- [ ] Freelancer can add/remove skill chips; field does not appear for clients
- [ ] Upload a .jpg/.png under 2MB — succeeds, avatar updates immediately
- [ ] Upload a .pdf or oversized file — rejected client-side with a clear message
- [ ] Refresh the page after editing — changes persisted (check MongoDB directly if unsure)

## 3. Project Module

- [ ] Client creates a project with all required fields — appears in "My Projects"
- [ ] Submitting the form with an empty title/description — inline validation blocks it
- [ ] Freelancer attempting POST /api/projects — 403 Forbidden (role check)
- [ ] Freelancer browse list shows only status: open projects
- [ ] Search filter narrows results by title/description
- [ ] Category filter narrows results correctly
- [ ] Client edits their own project — succeeds
- [ ] Client attempts to edit another client's project via API (change the :id) — 403 Forbidden
- [ ] Client deletes their own project — removed from list and DB

## 4. Bidding Module

- [ ] Freelancer submits a bid on an open project — succeeds
- [ ] Freelancer submits a second bid on the same project — blocked with "already submitted"
- [ ] Freelancer bids on a non-open project — blocked with "no longer accepting proposals"
- [ ] Client views bids on their own project — sees freelancer details + message + amount
- [ ] Client attempts to view bids on someone else's project via API — 403 Forbidden
- [ ] Client shortlists a bid — status updates to "shortlisted" instantly in UI
- [ ] Client accepts a bid — that bid becomes "accepted", all other bids on the project become "rejected", project status becomes "in-progress"

## 5. Project Completion + Reviews

- [ ] Client marks an "in-progress" project as "completed" — succeeds
- [ ] Client attempts to mark an "open" project as completed — blocked (must be in-progress first)
- [ ] Client submits a review for the freelancer on a completed project — succeeds, freelancer's average rating updates
- [ ] Freelancer submits a review for the client — succeeds
- [ ] Either party attempts a second review on the same project — blocked with "already reviewed"
- [ ] A user NOT involved in the project attempts to review it — 403 Forbidden
- [ ] Attempting to review an "open" or "in-progress" project — blocked with "only after completed"

## 6. Admin Module

- [ ] Non-admin (client/freelancer) hits any /api/admin/* route — 403 Forbidden
- [ ] Admin views all users — list matches the database
- [ ] Admin deletes a freelancer — their bids are also removed (check DB)
- [ ] Admin deletes a client — their projects AND bids on those projects are removed (check DB)
- [ ] Admin attempts to delete their own account — blocked
- [ ] Admin views all projects (including non-open ones) — full list shown
- [ ] Admin deletes any project — removed regardless of ownership
- [ ] Analytics numbers match actual DB counts (spot-check with MongoDB Compass or mongosh)

## 7. Cross-Cutting / UI

- [ ] Every list page shows a loading state while fetching
- [ ] Every list page shows a proper empty state when there's no data
- [ ] Killing the backend mid-session and refreshing a list page shows the error state with a working "Try again" button
- [ ] Resize the browser to a mobile width (375px) — navbar collapses to a toggle, forms stack in one column, no horizontal scroll
- [ ] All toast notifications appear for success/error actions across every module

## 8. Security spot-checks

- [ ] JWT expiry — wait or manually expire a token, confirm the app redirects to login instead of erroring
- [ ] Password is never returned in any API response (check every GET response body)
- [ ] Blocked user (if you flip isBlocked manually in the DB) cannot log in or use an existing token

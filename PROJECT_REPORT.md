# FreelanceHub — Project Report

## 1. Complete Feature List

### Authentication & Authorization
- Register/Login with JWT, bcrypt password hashing
- Role-based access control: Client, Freelancer, Admin
- Protected routes (frontend) + protected + role-gated routes (backend)

### Profile Module
- Editable name, bio, profile picture (Multer upload)
- Client-only field: Company Name
- Freelancer-only fields: Skills (chip input), Experience
- Average rating + review count displayed on profile

### Project Module
- Client: create, edit, delete, view own projects (any status)
- Freelancer: browse open projects, search by keyword, filter by category
- Status lifecycle: open -> in-progress -> completed

### Bidding Module
- Freelancer: submit one proposal per project (amount + message)
- Client: view all proposals on their project, shortlist, accept
- Accepting one bid auto-rejects all others on that project

### Project Completion Workflow
- Client marks an in-progress project as completed
- Completion is the gate that unlocks reviews for both parties

### Reviews & Ratings
- Both client and freelancer can review each other, once per project
- 1-5 star rating + written comment
- Average rating auto-recalculated and stored on the user

### Admin Dashboard
- Platform analytics: total users, clients, freelancers, projects, bids,
  and a breakdown of project statuses
- User management: view all users, delete a user (cascades to their
  projects/bids so no orphaned data remains)
- Project management: view all projects regardless of status, delete any

### UI/UX
- Custom design system on top of Bootstrap (navy + amber palette,
  Sora/Inter typography) - not default Bootstrap styling
- Toast notifications for every action (react-toastify)
- Reusable Loading / Empty / Error state components used consistently
- Responsive layout down to mobile widths

---

## 2. Project Architecture Diagram

```
                    +-----------------------------+
                    |     CLIENT (Browser)          |
                    |  React.js + Redux Toolkit     |
                    |  Axios + React Router DOM     |
                    |  Bootstrap + React Toastify   |
                    +-------------+-----------------+
                                  | HTTPS (Axios)
                                  v
                    +-----------------------------+
                    |      EXPRESS.JS SERVER        |
                    | +---------------------------+ |
                    | |  Routes (auth/users/       | |
                    | |  projects/bids/reviews/    | |
                    | |  admin)                    | |
                    | +---------------------------+ |
                    | |  Middleware                | |
                    | |  (JWT verify, role check,  | |
                    | |   Multer upload)           | |
                    | +---------------------------+ |
                    | |  Controllers               | |
                    | |  (business logic)          | |
                    | +---------------------------+ |
                    +-------------+-----------------+
                                  | Mongoose ODM
                                  v
                    +-----------------------------+
                    |          MongoDB              |
                    |  Users . Projects . Bids      |
                    |  Reviews                      |
                    +-----------------------------+
```

## 3. Database Schema Summary

```
User
 |- name, email (unique), password (bcrypt hash)
 |- role: client | freelancer | admin
 |- bio, profileImage
 |- companyName            (client)
 |- skills[], experience    (freelancer)
 |- averageRating, totalReviews   (recalculated on each review)
 |- isBlocked

Project
 |- title, description, budget, category, skillsRequired[]
 |- client -> User
 |- status: open | in-progress | completed
 |- selectedFreelancer -> User (set when a bid is accepted)

Bid
 |- project -> Project
 |- freelancer -> User
 |- amount, message
 |- status: pending | shortlisted | accepted | rejected
 |- unique index (project + freelancer) - one bid per freelancer per project

Review
 |- project -> Project
 |- reviewer -> User
 |- reviewee -> User
 |- rating (1-5), comment
 |- unique index (project + reviewer) - one review per side per project
```

---

## 4. Viva Questions & Answers

**Q: Why did you choose MERN over other stacks?**
A: MongoDB's flexible schema suits a marketplace where different roles
(client/freelancer) need different profile fields without rigid table
structures. React + Node/Express gave us one language (JavaScript) across
the whole stack, which was faster for a 4-person team to collaborate on.

**Q: How does JWT authentication work in your project?**
A: On login, the backend verifies the bcrypt-hashed password, then signs a
JWT containing the user's id and role with a secret key, valid for 7 days.
The frontend stores this token and attaches it as an Authorization: Bearer
<token> header on every request. A middleware (authMiddleware.js)
verifies the token on protected routes and attaches the decoded user to
req.user before the request reaches the controller.

**Q: How do you implement role-based access control?**
A: Two layers. First, authMiddleware confirms the user is logged in.
Second, roleMiddleware's authorizeRoles(...) checks req.user.role
against an allowed list for that route - e.g. only "client" can call
POST /api/projects. On the frontend, RoleRoute mirrors this so a
freelancer never even sees the "Post a project" page, though the real
enforcement is always server-side.

**Q: How do you prevent a freelancer from bidding twice on the same
project?**
A: A MongoDB compound unique index on (project, freelancer) in the Bid
schema. If a duplicate insert is attempted, MongoDB throws error code
11000, which the controller catches and returns as a friendly "you
already submitted a proposal" message instead of a raw database error.

**Q: What happens when a client accepts a bid?**
A: Three things happen in one flow: the accepted bid's status becomes
accepted; every other bid on that project is bulk-updated to rejected
via Bid.updateMany; and the project itself is updated to status:
in-progress with selectedFreelancer set to that freelancer.

**Q: How do you calculate a user's average rating?**
A: Whenever a review is created, recalculateRating() fetches every
review where that user is the reviewee, averages the rating field,
rounds it to one decimal, and saves averageRating + totalReviews back
onto the User document - so reading a profile is a single fast query
instead of an aggregation every time.

**Q: Why can reviews only happen after a project is "completed"?**
A: It's a deliberate gate in reviewController.createReview - checking
project.status !== "completed" - so reviews reflect actual finished
work rather than premature or retaliatory ratings mid-project.

**Q: How does file upload work?**
A: Multer's diskStorage engine saves the file to /backend/uploads with
a unique filename (Date.now() + random suffix), validated by a
fileFilter that only allows JPG/PNG under 2MB. The filename is saved on
the User document; Express serves the /uploads folder statically so the
frontend just builds ${BACKEND_URL}/uploads/<filename>.

**Q: How is state managed on the frontend?**
A: Redux Toolkit, with one slice per domain (auth, projects, bids,
reviews, admin). Each slice uses createAsyncThunk for API calls, so
loading/success/error states are handled consistently everywhere,
and extraReducers updates the store based on the thunk's outcome.

**Q: What was the hardest part of the project?**
A: Getting the bidding + acceptance flow consistent - making sure
accepting one bid correctly cascades to reject the others and update the
project status, all without leaving the database in an inconsistent
state if one step failed.

**Q: What would you improve given more time?**
A: Real-time notifications and chat via Socket.io, a payment integration
for actually transferring funds, and moving file storage to a cloud
provider so uploads survive redeploys.

---

## 5. Resume Description

FreelanceHub - Full-Stack Freelance Marketplace (MERN)
Built a role-based freelancing platform (client/freelancer/admin) using
React, Redux Toolkit, Node.js, Express, and MongoDB. Implemented JWT
authentication with bcrypt hashing, a bidding/proposal system with
automatic bid-rejection cascading on acceptance, a post-completion
review system with live-recalculated average ratings, and an admin
dashboard with cascading user/project deletion and platform analytics.
Designed a custom Bootstrap-based UI system and deployed the app across
MongoDB Atlas, Render, and Vercel.

(Trim to 2-3 lines for a resume; use the fuller version above in a
cover letter or portfolio writeup.)

---

## 6. Project Report Summary

FreelanceHub is a full-stack freelancing marketplace built with the MERN
stack (MongoDB, Express.js, React.js, Node.js), developed as a
college submission project by a team of four. The platform connects
clients who need work done with freelancers who can do it, mediated by a
transparent bidding process and closed out with a mutual review system -
modeling the core loop of real platforms like Upwork and Fiverr.

The system supports three roles - Client, Freelancer, and Admin - each
with distinct permissions enforced at both the UI and API level. Clients
can post projects, review incoming proposals, accept a freelancer, and
mark work as completed. Freelancers can browse and filter open projects,
submit one proposal per project, and track their proposal history.
Once a project is completed, both parties can rate and review each
other, with average ratings recalculated automatically. An admin role
oversees the platform through a dashboard showing live analytics (user
counts, project counts, bid counts) and can moderate by removing users or
projects, with cascading deletes to prevent orphaned data.

Technically, the backend exposes a RESTful API secured with JWT
authentication and bcrypt password hashing, with role-based middleware
guarding every sensitive route. MongoDB (via Mongoose) stores four core
collections - Users, Projects, Bids, and Reviews - linked by ObjectId
references. The frontend is a single-page React application using Redux
Toolkit for state management, React Router for navigation and route
guarding, and a custom design system built on Bootstrap for a distinctive,
non-templated visual identity. File uploads (profile pictures) are
handled via Multer with server-side validation.

The project was scoped deliberately: real-time chat and payment
processing were identified as valuable but non-essential extensions,
allowing the team to deliver a complete, tested, and deployed core
product - authentication through to reviews - within a compressed
timeline. The application is deployed with the frontend on Vercel, the
backend on Render, and the database on MongoDB Atlas.

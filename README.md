# Bastion LMS: Super Admin Panel

Web panel for the `platform_admin` role, backed by the Bastion LMS API
(see the backend repo's `postman/Bastion-LMS-SuperAdmin.postman_collection.json`).

## Setup

```bash
cp .env.example .env.local   # then set VITE_API_BASE_URL
npm install
npm run dev
```

`VITE_API_BASE_URL` must also be set in Vercel's project env vars. Without it the build uses the default in
`src/lib/api.ts`. Sign in with a seeded `platform_admin` account (there's no signup for this role).

## What's connected

| Screen | API |
| --- | --- |
| Login / auth guard | `POST /users/login`, `GET /users/profile` |
| Dashboard | `/admin/companies`, `/admin/users`, `/courses`, `/forms`, `/enrollments`, `/certificates` |
| Companies | `GET /admin/companies`, `POST /users/company-admins`, `POST /company` |
| Company detail | `GET/PATCH/DELETE /company/:id`, `GET /company/:id/dashboard`, plus every list below filtered by `companyId` |
| Users | `GET /admin/users`, `POST /users`, `DELETE /users/:id` |
| Courses | `GET /courses`, `GET /courses/library`, `GET/DELETE /courses/:id` |
| Forms | `GET /forms`, `GET/DELETE /forms/:id`, `GET /forms/:id/responses` |
| Enrollments | `GET /enrollments`, `DELETE /enrollments/:id` |
| Certificates | `GET /certificates`, `DELETE /certificates/:id` |
| Uploads | `GET /uploads`, `DELETE /uploads/:id` |
| Billing | `GET/POST/PATCH/DELETE /billing/plans`, `GET /billing/tenants`, `GET /billing/tenants/:companyId`, `POST /billing/tenants/:companyId/grace-period`, `POST /billing/tenants/:companyId/cancel` |
| Notification bell | `GET /notifications` |
| Profile | `GET /users/profile`, `PATCH /users/:id`, `PATCH /users/:id/change-password`, `GET /enrollments/my-courses` |
| Settings → Super Admins | `GET /admin/users?role=platform_admin`, `DELETE /users/:id`, `POST /users/super-admins` (**not in backend yet**) |

Billing amounts come from the API in cents and are divided by 100 for display. This panel never collects card details.

Still mock data (shown with a banner): **Analytics**, **Notifications**, and the **General** tab in Settings.

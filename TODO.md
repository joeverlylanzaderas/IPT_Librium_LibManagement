    # TODO - Admin dashboard backend connectivity

- [x] Inspect existing frontend admin/member API wrappers and backend endpoint availability
- [x] Create `frontend/src/api/admin.js` with `getDashboardStats()` calling `GET /dashboard/stats/`

- [x] Update `frontend/app/(admin)/index.jsx` to fetch and render dashboard stats with loading/error states

- [ ] Wire `frontend/app/(admin)/manage-books.jsx` to backend books CRUD endpoints (list/create)
- [ ] Wire `frontend/app/(admin)/manage-loans.jsx` to backend loans CRUD endpoints (list/create/verify return as supported)
- [ ] Wire `frontend/app/(admin)/manage-members.jsx` to backend user endpoints (if supported) or show a clear placeholder/error

- [ ] Add/extend frontend API wrappers as needed (`frontend/src/api/users.js` etc.)
- [ ] Run frontend build/start and verify admin role can access stats
- [ ] Run quick API sanity checks from the frontend (ensure auth + refresh works)


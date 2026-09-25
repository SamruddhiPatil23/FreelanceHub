// components/RoleRoute.jsx
// Purpose: wraps a page that only specific roles should see, e.g. Admin Dashboard
// should only be visible to role === "admin". Assumes PrivateRoute already
// confirmed the user is logged in.
// Usage: <Route element={<RoleRoute allowedRoles={["admin"]} />}>...</Route>

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;

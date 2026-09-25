// components/PrivateRoute.jsx
// Purpose: wraps any page that requires login. If there's no user in Redux
// state, redirect to /login instead of rendering the page.

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

// pages/Home.jsx
// Purpose: "/" shows a different real dashboard depending on role.

import { useSelector } from "react-redux";
import ClientProjects from "./ClientProjects";
import BrowseProjects from "./BrowseProjects";
import AdminDashboard from "./AdminDashboard";

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "client") return <ClientProjects />;
  if (user?.role === "freelancer") return <BrowseProjects />;
  return <AdminDashboard />;
};

export default Home;

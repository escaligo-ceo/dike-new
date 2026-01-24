import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import TrashContacts from "./pages/TrashContacts";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/contacts/trash" element={<TrashContacts />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

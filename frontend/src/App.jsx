import { Route, Routes } from "react-router-dom"; // ✅ Added Route import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login";
import Profile from "./pages/Profile.jsx"; // ✅ Importing Profile component
import Signup from "./pages/Signup.jsx";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* ✅ Added Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} /> {/* ✅ Added Profile route */}
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default App;

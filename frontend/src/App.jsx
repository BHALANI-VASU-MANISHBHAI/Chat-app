import { Route, Routes } from "react-router-dom"; // ✅ Added Route import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup.jsx";
import ShowFriend from "./pages/ShowFriend.jsx";
import Dashboard from "./pages/Dashboard.jsx";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/show-friend" element={<ShowFriend />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
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

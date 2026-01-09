import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile from "../pages/Profile";
import CodeRunner from "../pages/CodeRunner";
import DiffTester from "../pages/DiffTester";
import ComingSoon from "../pages/ComingSoon";  // ✅ NEW

// ✅ Feature Flag - Change to true when ready to reveal
const SHOW_HIDDEN_FEATURES = false;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Always Available */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Hidden Until Ready */}
        <Route 
          path="/profile" 
          element={!SHOW_HIDDEN_FEATURES ? <Profile /> : <ComingSoon />} 
        />
        <Route 
          path="/coderunner" 
          element={SHOW_HIDDEN_FEATURES ? <CodeRunner /> : <ComingSoon />} 
        />
        <Route 
          path="/diff" 
          element={SHOW_HIDDEN_FEATURES ? <DiffTester /> : <ComingSoon />} 
        />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
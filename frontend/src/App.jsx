import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile from "../pages/Profile";
import CodeRunner from "../pages/CodeRunner";
import DiffTester from "../pages/DiffTester";
import ContestMania from "../pages/ContestMania";
import ComingSoon from "../pages/ComingSoon";
import RAGSearch from "../pages/RAGSearch";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - NO NAVBAR */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes - WITH NAVBAR */}
          <Route element={<Layout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/coderunner" element={<CodeRunner />} />
            <Route path="/diff" element={<ComingSoon />} />
            <Route path="/contests" element={<ContestMania />} />
            <Route path="/rag-search" element={<RAGSearch />} />
          </Route>

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
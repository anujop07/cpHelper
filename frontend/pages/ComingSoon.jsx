import { useNavigate, useLocation } from "react-router-dom";

function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();

  // Custom messages based on route
  const pageInfo = {
    "/profile": {
      title: "Profile",
      description: "View your CP stats and manage your handles.",
      icon: "👤",
    },
    "/coderunner": {
      title: "Code Runner",
      description: "Run C++ code in a secure sandbox.",
      icon: "▶️",
    },
    "/diff": {
      title: "Differential Testing",
      description: "Find bugs by comparing two solutions.",
      icon: "🐛",
    },
  };

  const info = pageInfo[location.pathname] || {
    title: "Feature",
    description: "Something awesome is coming!",
    icon: "🚀",
  };

  // ✅ FIXED: Proper full-screen centering for laptop
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1a1a2e",
      color: "white",
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
      padding: "20px",
      boxSizing: "border-box",
    }}>
      {/* Icon */}
      <div style={{ fontSize: "80px", marginBottom: "20px" }}>
        {info.icon}
      </div>

      {/* Title */}
      <h1 style={{ 
        fontSize: "48px", 
        marginBottom: "10px",
        background: "linear-gradient(90deg, #00d4ff, #7b2cbf)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        {info.title}
      </h1>

      {/* Coming Soon Badge */}
      <h2 style={{ 
        color: "#ff6b6b", 
        marginBottom: "20px",
        fontSize: "24px",
      }}>
        Coming Soon
      </h2>

      {/* Description */}
      <p style={{ 
        fontSize: "16px", 
        color: "#888",
        maxWidth: "400px",
        lineHeight: "1.6",
        margin: "0 auto",
      }}>
        {info.description}
      </p>

      {/* Expected Launch Box */}
      <div style={{
        marginTop: "30px",
        padding: "15px 30px",
        backgroundColor: "#2d2d44",
        borderRadius: "10px",
      }}>
        <p style={{ margin: 0, color: "#888" }}>Expected Launch</p>
        <p style={{ 
          margin: "5px 0 0 0", 
          fontSize: "24px", 
          color: "#00d4ff",
          fontWeight: "bold",
        }}>
          February 2026
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/login")}
        style={{
          marginTop: "40px",
          padding: "12px 30px",
          fontSize: "16px",
          backgroundColor: "transparent",
          color: "#00d4ff",
          border: "2px solid #00d4ff",
          borderRadius: "25px",
          cursor: "pointer",
        }}
      >
        ← Back to Login
      </button>
    </div>
  );
}

export default ComingSoon;
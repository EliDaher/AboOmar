import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard as the main app page
    navigate("/AboOmar/dashboard", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      navigate("/login");
      return;
    }

    // TODO: Validare il token con il backend se necessario
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return { isAuthenticated, isLoading, logout };
}

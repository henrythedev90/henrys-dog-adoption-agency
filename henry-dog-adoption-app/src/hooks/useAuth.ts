import { useState, useEffect } from "react";
import axios from "axios";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>();

  useEffect(() => {
    const checkIfAuth = async () => {
      try {
        await axios.get("api/auth/check");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkIfAuth();
  }, []);

  return { isAuthenticated };
}

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LoadingSpinner from "../ui/LoadingSpinner";
import { checkAuth } from "@/store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, loading } = useAppSelector((state) => state.auth);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [isInLogoutFlow, setIsInLogoutFlow] = useState(false);

  useEffect(() => {
    // Check if we're in a logout flow by checking sessionStorage or URL
    const logoutDetected =
      sessionStorage.getItem("manual_logout") === "true" ||
      window.location.search.includes("logout");

    if (logoutDetected) {
      console.log("ProtectedRoute: Logout detected, bypassing protected route");
      setIsInLogoutFlow(true);
      // Don't check auth, just initiate redirect
      setRedirecting(true);
      window.location.replace("/");
      return;
    }

    const checkAuthStatus = async () => {
      await dispatch(checkAuth());
      setHasCheckedAuth(true);
    };
    checkAuthStatus();
  }, [dispatch]);

  // If not logged in and not already redirecting, trigger redirect
  useEffect(() => {
    if (
      !isInLogoutFlow &&
      hasCheckedAuth &&
      !loading &&
      !isLoggedIn &&
      !redirecting
    ) {
      console.log(
        "ProtectedRoute: User not logged in after auth check, redirecting"
      );
      setRedirecting(true);
      window.location.replace("/");
    }
  }, [isLoggedIn, loading, hasCheckedAuth, redirecting, isInLogoutFlow]);

  // If we detect a logout while mounted, react immediately
  useEffect(() => {
    if (!isInLogoutFlow && !isLoggedIn && hasCheckedAuth && !redirecting) {
      console.log("ProtectedRoute: Login state changed to false, redirecting");
      setRedirecting(true);
      window.location.replace("/");
    }
  }, [isLoggedIn, hasCheckedAuth, redirecting, isInLogoutFlow]);

  // If in logout flow or redirecting, show loading
  if (isInLogoutFlow || redirecting) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <LoadingSpinner size="large" />
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Show loading while checking auth
  if (loading || !hasCheckedAuth) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <LoadingSpinner size="large" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Don't render if not logged in
  if (!isLoggedIn) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <LoadingSpinner size="large" />
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;

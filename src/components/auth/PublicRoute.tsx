import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LoadingSpinner from "../ui/LoadingSpinner";
import { checkAuth } from "@/store/slices/authSlice";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoggedIn, loading } = useAppSelector((state) => state.auth);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [preventRedirect, setPreventRedirect] = useState(false);

  useEffect(() => {
    // Check if this is a logout redirect
    const isLogoutRedirect =
      window.location.search.includes("logout") ||
      sessionStorage.getItem("manual_logout") === "true";

    if (isLogoutRedirect) {
      console.log(
        "PublicRoute: Detected logout redirect, preventing auth checks"
      );
      setPreventRedirect(true);
      // Clear the flag after handling it
      sessionStorage.removeItem("manual_logout");
      // Skip auth check completely
      setHasCheckedAuth(true);
      return;
    }

    // Only run auth check if not a logout redirect
    const checkAuthStatus = async () => {
      await dispatch(checkAuth());
      setHasCheckedAuth(true);
    };
    checkAuthStatus();
  }, [dispatch]);

  // Only redirect if not in a logout flow
  useEffect(() => {
    if (hasCheckedAuth && !loading && isLoggedIn && !preventRedirect) {
      router.push("/dogs");
    }
  }, [isLoggedIn, loading, router, hasCheckedAuth, preventRedirect]);

  // Show loading state
  if (loading && !preventRedirect) {
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
        <p>Loading...</p>
      </div>
    );
  }

  // If coming from logout, render children immediately
  if (preventRedirect) {
    console.log("PublicRoute: Rendering login page directly (after logout)");
    return <>{children}</>;
  }

  // If logged in and not a logout redirect, don't render children
  if (isLoggedIn && hasCheckedAuth && !preventRedirect) {
    return null;
  }

  // Render children (login page)
  return <>{children}</>;
};

export default PublicRoute;

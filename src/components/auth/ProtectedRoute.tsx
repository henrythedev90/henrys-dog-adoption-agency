import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LoadingSpinner from "../ui/LoadingSpinner";
import { checkAuth } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, loading } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifyAuth = async () => {
      try {
        // Only check auth if we don't know the status
        if (!isLoggedIn) {
          await dispatch(checkAuth());
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    verifyAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (!isChecking && !loading && !isLoggedIn) {
      router.replace("/");
    }
  }, [isChecking, loading, isLoggedIn, router]);

  // Show loading state only during initial check
  if (isChecking || loading) {
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

  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;

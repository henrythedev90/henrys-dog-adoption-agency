"use client";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { RootState } from "@/store/index";
import styles from "./styles/Navigation.module.css";

// Auth selector
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;

// Auth action
export const logoutUser = () => ({
  type: "auth/logout" as const,
});

export const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLoggedIn = useSelector<RootState, boolean>(selectIsLoggedIn);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <nav className={styles.navigation}>
      {pathname === "/favorites" ? (
        <Link to="/" className={styles.nav_link}>
          Back to Search
        </Link>
      ) : (
        <Link to="/favorites" className={styles.nav_link}>
          Favorites
        </Link>
      )}
      {isLoggedIn && (
        <button onClick={handleLogout} className={styles.nav_button}>
          Logout
        </button>
      )}
    </nav>
  );
};

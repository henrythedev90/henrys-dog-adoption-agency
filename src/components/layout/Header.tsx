"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { logout, logoutUser } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Container from "../ui/Container";
import classes from "./styles/Header.module.css";
import Button from "../ui/Button";
import SplitColorText from "../ui/SplitColorText";
import LoadingSpinner from "../ui/LoadingSpinner";
import { clearFavorite, fetchFavoriteDogs } from "@/store/slices/dogsSlice";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite);
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchFavoriteDogs());
    }
  }, [isLoggedIn, dispatch]);

  const handleLogout = async () => {
    try {
      // Use the logout thunk which handles token deletion and state cleanup
      await dispatch(logoutUser());
      dispatch(clearFavorite());

      // Redirect to home page
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the API call fails, clear local state
      dispatch(logout());
      router.replace("/");
    }
  };

  const handleFavoritesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push("/dogs/favorites");
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push("/dogs");
  };

  const isFavoritesPage = pathname === "/dogs/favorites";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isNavigating) {
    return (
      <header className={classes.header}>
        <Container>
          <div className={`${classes.nav_wrapper} ${classes.loading_wrapper}`}>
            <SplitColorText
              text="The Fetch Adoption Center"
              tag="h3"
              size="medium"
            />
            <div className={classes.loading_container}>
              <LoadingSpinner size="small" />
              <p className={classes.loading_text}>
                Loading {isFavoritesPage ? "search" : "favorites"}...
              </p>
            </div>
          </div>
        </Container>
      </header>
    );
  }

  return (
    <header className={classes.header}>
      <Container>
        <div className={classes.nav_wrapper}>
          <SplitColorText
            text="The Fetch Adoption Center"
            tag="h3"
            size="medium"
          />
          <div
            className={`${classes.nav_menu} ${
              isMenuOpen ? classes.nav_menu_open : ""
            }`}
          >
            {isFavoritesPage ? (
              <Link
                href="/dogs"
                onClick={handleSearchClick}
                className={classes.nav_link}
              >
                Back to Search
              </Link>
            ) : (
              <Link
                href="/dogs/favorites"
                onClick={handleFavoritesClick}
                className={classes.nav_link}
              >
                View Favorites ({favorites.length})
              </Link>
            )}

            {isLoggedIn && (
              <Button
                onClickFunction={handleLogout}
                variant="secondary"
                className={classes.nav_button}
              >
                Logout
              </Button>
            )}
          </div>
          <div className={classes.hamburger} onClick={toggleMenu}>
            <div
              className={`${classes.hamburger_line} ${
                isMenuOpen ? classes.hamburger_line_open : ""
              }`}
            />
            <div
              className={`${classes.hamburger_line} ${
                isMenuOpen ? classes.hamburger_line_open : ""
              }`}
            />
            <div
              className={`${classes.hamburger_line} ${
                isMenuOpen ? classes.hamburger_line_open : ""
              }`}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}

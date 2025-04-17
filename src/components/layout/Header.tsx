"use client";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { logout } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Container from "../ui/Container";
import classes from "./styles/Header.module.css";
import Button from "../ui/Button";
import SplitColorText from "../ui/SplitColorText";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite);
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLogout = () => {
    // 1. Dispatch redux action to update state
    dispatch(logout());

    // 2. Clear all localStorage
    localStorage.clear();

    // 3. Set a flag to prevent redirect loops
    sessionStorage.setItem("manual_logout", "true");

    // 4. Clear any auth cookies by overwriting them
    document.cookie =
      "fetch-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;";
    document.cookie =
      "fetch-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;";

    // 5. Add logout param to URL to signal we're logging out
    console.log("Manual logout initiated, redirecting");

    // 6. Force a complete page reload with logout param
    window.location.replace("/?logout=true");
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

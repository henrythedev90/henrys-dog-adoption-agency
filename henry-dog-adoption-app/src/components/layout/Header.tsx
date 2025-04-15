"use client";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { logoutUser } from "@/store/slices/authSlice";
import { resetAuth } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Container from "../ui/Container";
import classes from "./styles/Header.module.css";
import Button from "../ui/Button";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite);
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(resetAuth());
    router.push("/");
  };

  const isFavoritesPage = pathname === "/dogs/favorites";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={classes.header}>
      <Container>
        <div className={classes.nav_wrapper}>
          <h3>The Fetch Adoption Center</h3>
          <div
            className={`${classes.nav_menu} ${
              isMenuOpen ? classes.nav_menu_open : ""
            }`}
          >
            {isFavoritesPage ? (
              <Link href="/dogs" className={classes.nav_link}>
                Back to Search
              </Link>
            ) : (
              <Link href="/dogs/favorites" className={classes.nav_link}>
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

            <div className={classes.mobile_logo}>
              <Link href="/" className={classes.logo_link}>
                <h1 className={classes.mobile_logo_title}>
                  <span>F</span>etch
                </h1>
              </Link>
            </div>
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

import React from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { logoutUser } from "@/store/slices/authSlice";
import { clearFavorite, clearBreeds } from "@/store/slices/dogsSlice";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Container from "../ui/Container";
import classes from "./style/Header.module.css";
import Button from "../ui/Button";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite);
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearFavorite());
    dispatch(clearBreeds());
    router.push("/");
  };

  const isFavoritesPage = pathname === "/dogs/favorites";

  return (
    <header className={classes.header}>
      <Container>
        <div className={classes.nav_wrapper}>
          <h3>The Fetch Adoption App</h3>
          <div className={classes.nav_menu}>
            {isFavoritesPage ? (
              <Link href="/dogs">Back to Search</Link>
            ) : (
              <Link href="/dogs/favorites">
                View Favorites ({favorites.length})
              </Link>
            )}
            {isLoggedIn && (
              <Button onClickFunction={handleLogout}>Logout</Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

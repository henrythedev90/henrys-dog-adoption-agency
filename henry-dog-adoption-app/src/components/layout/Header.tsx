import React from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { logout } from "@/store/slices/authSlice";
import { clearFavorite } from "@/store/slices/dogsSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite);
  const { name, email, isLoggedIn } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearFavorite());
    router.push("/");
  };

  console.log(isLoggedIn, "this isLoggedIn");

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Henry's Dog Adoption Agency
            </h1>
            {isLoggedIn && (
              <div className="mt-1 text-sm text-gray-600">
                <p>Welcome, {name}</p>
                <p className="text-xs">{email}</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dogs/favorites">
              View Favorites ({favorites.length})
            </Link>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

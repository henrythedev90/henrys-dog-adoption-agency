"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import classes from "./style/LoginForm.module.css";

const LoginForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, error, isLoggedIn } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn) {
      setIsNavigating(true);
      router.push("/dogs");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ name, email }));
  };

  if (loading || isNavigating) {
    return (
      <div className={classes.loading_container}>
        <LoadingSpinner />
        <p className={classes.loading_text}>
          {loading ? "Logging in..." : "Redirecting to dashboard..."}
        </p>
      </div>
    );
  }

  return (
    <div className={classes.input_container}>
      {error && <div className={classes.error_message}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Name"
          value={name}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="primary" type="submit">
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;

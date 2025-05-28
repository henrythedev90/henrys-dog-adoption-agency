"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import classes from "./style/LoginForm.module.css";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const { loading, error, isLoggedIn } = useAppSelector((state) => state.auth);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      setIsNavigating(true);
      router.push("/dogs");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginUser({ emailOrUsername, password }));
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
      <div className={classes.form_title_container}>
        <h2>Welcome Back!</h2>
        <p>Please enter your details to sign in</p>
      </div>
      {error && <div className={classes.error_message}>{error}</div>}
      <form onSubmit={handleSubmit} className={classes.form}>
        <div className={classes.inputGroup}>
          <input
            id="emailOrUsername"
            name="emailOrUsername"
            type="text"
            autoComplete="username"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />
        </div>
        <div className={classes.inputGroup}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;

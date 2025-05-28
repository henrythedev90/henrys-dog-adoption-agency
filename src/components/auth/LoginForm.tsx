"use client";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import classes from "./style/LoginForm.module.css";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [emailOrUserName, setEmailOrUserName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser({ emailOrUserName, password }));
      if (result.meta.requestStatus === "fulfilled") {
        router.replace("/dogs");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (loading) {
    return (
      <div className={classes.loading_container}>
        <LoadingSpinner />
        <p className={classes.loading_text}>Signing in...</p>
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
            id="emailOrUserName"
            name="emailOrUserName"
            type="text"
            autoComplete="username"
            placeholder="Email or Username"
            value={emailOrUserName}
            onChange={(e) => setEmailOrUserName(e.target.value)}
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

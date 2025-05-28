"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import classes from "./style/LoginForm.module.css";

const SignUpForm = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      // If signup successful, log the user in
      setIsNavigating(true);
      router.push("/dogs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  if (loading || isNavigating) {
    return (
      <div className={classes.loading_container}>
        <LoadingSpinner />
        <p className={classes.loading_text}>
          {loading ? "Creating account..." : "Redirecting to dashboard..."}
        </p>
      </div>
    );
  }

  return (
    <div className={classes.input_container}>
      <div className={classes.form_title_container}>
        <h2>New here?</h2>
        <p>Please enter your details to create an account</p>
      </div>
      {error && <div className={classes.error_message}>{error}</div>}
      <form onSubmit={handleSubmit} className={classes.form}>
        <input
          id="userName"
          name="userName"
          className={classes.inputGroup}
          type="text"
          placeholder="Username"
          value={userName}
          autoComplete="username"
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          id="email"
          name="email"
          className={classes.inputGroup}
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          id="password"
          name="password"
          className={classes.inputGroup}
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button variant="primary" type="submit">
          Sign Up
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;

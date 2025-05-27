"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import classes from "./style/LoginForm.module.css";

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
          firstName,
          lastName,
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
      {error && <div className={classes.error_message}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="First Name"
          value={firstName}
          autoComplete="given-name"
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={lastName}
          autoComplete="family-name"
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          id="userName"
          name="userName"
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

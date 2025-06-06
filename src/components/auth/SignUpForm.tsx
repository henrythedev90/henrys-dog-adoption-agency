"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import classes from "./style/LoginForm.module.css";
import { apiClient } from "@/lib/apiClient";

const SignUpForm = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.post("/auth/signup", {
        userName,
        email,
        password,
      });

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.token}`;
      }

      // Wait for the token to be set before redirecting
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/dogs/get-started");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={classes.loading_container}>
        <LoadingSpinner />
        <p className={classes.loading_text}>Creating account...</p>
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

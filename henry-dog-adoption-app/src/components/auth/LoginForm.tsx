import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Button from "@/components/ui/Button";

const LoginForm = ({ onSuccessLogin }: { onSuccessLogin: () => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const route = "/auth/login";

  const handleSubmit = async (e: React.FormEvent) => {
    console.log();
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiClient.post(route, { name, email });

      if (res.status !== 200) {
        throw new Error("Login Failed");
      }
      localStorage.setItem("user", JSON.stringify({ name, email }));
      onSuccessLogin();
    } catch (err) {
      setError("Email or Password is correct. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="primary" isLoading={loading} type="submit">
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;

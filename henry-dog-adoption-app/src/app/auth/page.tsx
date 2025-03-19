"use client";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

const AuthPage = () => {
  const router = useRouter();

  const handleSuccessLogin = () => {
    console.log("Login was successfull");
    router.push("/dogs");
  };

  return (
    <div>
      <div>
        <h1>Login to adoption center</h1>
        <LoginForm onSuccessLogin={handleSuccessLogin} />
      </div>
    </div>
  );
};

export default AuthPage;

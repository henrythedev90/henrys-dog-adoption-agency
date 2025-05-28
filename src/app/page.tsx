"use client";
import { useState, useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import PublicRoute from "@/components/auth/PublicRoute";
import classes from "@/components/auth/style/LoginForm.module.css";
import pageClasses from "./page.module.css";
import Container from "@/components/ui/Container";
import SplitText from "@/components/ui/SplitText";
import Button from "@/components/ui/Button";

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const onToggleForm = () => {
    setIsAnimating(true);
    setDirection(isLogin ? "next" : "prev");
    setTimeout(() => {
      setIsLogin((prev) => !prev);
      setIsAnimating(false);
    }, 300); // Match this with CSS transition duration
  };

  return (
    <PublicRoute>
      <div className={pageClasses.page}>
        <Container>
          <div className={classes.form_container}>
            <div className={classes.login_container}>
              <h1>
                <SplitText
                  copy="WELCOME TO FETCH ADOPTION CENTER!"
                  role="heading"
                />
              </h1>
              <div className={classes.form_type_container}>
                <div
                  className={`${classes.form_wrapper} ${
                    isAnimating
                      ? direction === "next"
                        ? classes.exit
                        : classes.exit_next
                      : direction === "next"
                      ? classes.enter_next
                      : classes.enter
                  }`}
                >
                  {isLogin ? <LoginForm /> : <SignUpForm />}
                </div>
                <div className={classes.toggle_button_container}>
                  {isLogin ? (
                    <Button
                      variant="primary"
                      className={classes.toggle_button}
                      onClickFunction={onToggleForm}
                    >
                      Don't have an account?
                    </Button>
                  ) : (
                    <Button
                      variant="tertiary"
                      className={classes.toggle_button}
                      onClickFunction={onToggleForm}
                    >
                      Already have an account?
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PublicRoute>
  );
}

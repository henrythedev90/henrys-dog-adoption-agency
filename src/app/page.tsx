"use client";
import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import PublicRoute from "@/components/auth/PublicRoute";
import classes from "@/components/auth/style/LoginForm.module.css";
import pageClasses from "./page.module.css";
import Container from "@/components/ui/Container";
import SplitText from "@/components/ui/SplitText";

export default function Page() {
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
              <div>
                <LoginForm />
                <SignUpForm />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PublicRoute>
  );
}

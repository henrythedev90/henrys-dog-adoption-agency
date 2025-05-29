"use client";
import React from "react";
import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from "@/components/layout/Footer";
export default function Page() {
  return (
    <ProtectedRoute>
      <Header />
      <Container>
        <h1>Profile</h1>
        <h2>Change Password</h2>
        <form>
          <input type="password" placeholder="Current Password" />
          <input type="password" placeholder="New Password" />
          <button type="submit">Change Password</button>
        </form>
        <h2>Delete Account</h2>
        <button type="button">Delete Account</button>

        <h2>Logout</h2>
        <button type="button">Logout</button>
      </Container>
      <Footer />
    </ProtectedRoute>
  );
}

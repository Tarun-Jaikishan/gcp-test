"use client";

import { useState } from "react";

import RecaptchaScript from "../components/RecaptchaScript";

export default function Home() {
  const [email, setEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Get the token from Google
    if (!window.grecaptcha) {
      alert("Recaptcha not loaded yet!");
      return;
    }

    const token = await window.grecaptcha.enterprise.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      { action: "LOGIN" } // Label this action
    );

    // 2. Send token + form data to YOUR backend
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, token }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    console.log(data);
    if (data.status) {
      alert("Login Successful!");
    } else {
      alert("Bot detected or Login failed!");
    }
  };

  return (
    <div>
      <RecaptchaScript /> {/* Load the script */}
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

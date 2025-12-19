"use client";

import Script from "next/script";
import { useState } from "react";

export default function LoginWithCheckbox() {
  const [email, setEmail] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    // 1. Get the token from the Checkbox Widget
    // "grecaptcha.enterprise.getResponse()" gets the token from the visible widget
    const token = window.grecaptcha.enterprise.getResponse();

    if (!token) {
      alert("Please check the box to prove you are human!");
      return;
    }

    // 2. Send to Backend
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, token }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      alert("Success!");
    } else {
      alert("Failed: " + data.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Load the Google Script */}
      <Script
        src="https://www.google.com/recaptcha/enterprise.js"
        strategy="afterInteractive"
        async
        defer
      />

      <form onSubmit={handleLogin}>
        <h1>Login (Checkbox Version)</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ display: "block", marginBottom: 10 }}
        />

        {/* This DIV renders the Checkbox Widget */}
        {/* Replace data-sitekey with your NEW CHECKBOX KEY */}
        <div
          className="g-recaptcha"
          data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          data-action="LOGIN"
        ></div>

        <br />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token) {
      return NextResponse.json({ message: "Token missing" }, { status: 400 });
    }

    // Configuration
    const projectID = process.env.RECAPTCHA_PROJECT_ID;
    const apiKey = process.env.RECAPTCHA_API_KEY;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // IMPORTANT: This must match the frontend { action: "LOGIN" } exactly
    const EXPECTED_ACTION = "LOGIN";

    // Verify with Google
    const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

    const googleResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          token: token,
          siteKey: siteKey,
          expectedAction: EXPECTED_ACTION,
        },
      }),
    });

    const googleData = await googleResponse.json();

    // --- SECURITY CHECKS ---

    // 1. Check if token is valid
    if (!googleData.tokenProperties.valid) {
      console.error("Invalid Token:", googleData.tokenProperties.invalidReason);
      return NextResponse.json({ message: "Invalid Token" }, { status: 400 });
    }

    // 2. Check if the Action matches (Prevent token reuse)
    if (googleData.tokenProperties.action !== EXPECTED_ACTION) {
      console.error("Action Mismatch:", googleData.tokenProperties.action);
      return NextResponse.json({ message: "Invalid Action" }, { status: 400 });
    }

    // 3. Check the Score (0.0 = Bot, 1.0 = Human)
    const score = googleData.riskAnalysis.score;
    if (score < 0.5) {
      console.warn(`Bot detected for ${email}. Score: ${score}`);
      return NextResponse.json(
        { message: "Bot behavior detected" },
        { status: 403 }
      );
    }

    // --- SUCCESS ---
    console.log(`User ${email} passed with score: ${score}`);

    return NextResponse.json(
      { status: true, message: "Login Successful", score: score },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

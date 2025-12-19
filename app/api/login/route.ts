import { NextResponse } from "next/server";

// POST -> /api/login
export async function POST(request: Request) {
  try {
    // 1. Get the data sent from the Frontend
    const body = await request.json();
    const { token, email } = body;

    // Quick check: If no token provided, stop immediately
    if (!token) {
      return NextResponse.json(
        { status: false, message: "Recaptcha token missing" },
        { status: 400 }
      );
    }

    // 2. Define your Google Cloud keys (from env variables)
    const projectID = process.env.RECAPTCHA_PROJECT_ID;
    const apiKey = process.env.RECAPTCHA_API_KEY;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // 3. Construct the Google Verification URL
    const verifyUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

    // 4. Send the token to Google to verify
    const googleResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          token: token,
          siteKey: siteKey,
          expectedAction: "LOGIN", // This MUST match the action name used in frontend
        },
      }),
    });

    const googleData = await googleResponse.json();

    console.log("start");

    console.log(googleData);

    console.log("end");

    // 5. VALIDATION CHECKS

    // Check A: Is the token actually valid?
    if (!googleData.tokenProperties.valid) {
      return NextResponse.json(
        { status: false, message: "Invalid Token" },
        { status: 400 }
      );
    }

    // Check B: Verify the Action matches (CRITICAL STEP YOU MISSED)
    // The frontend sent 'LOGIN', but you wrote 'LOGINS' in your expectedAction.
    // Make sure these match exactly in your code.
    if (googleData.tokenProperties.action !== "LOGIN") {
      return NextResponse.json(
        { status: false, message: "Invalid Action" },
        { status: 400 }
      );
    }

    // Check C: Score Check
    if (googleData.riskAnalysis.score < 0.5) {
      return NextResponse.json(
        { status: false, message: "Bot detected" },
        { status: 403 }
      );
    }

    // --- SAFETY CHECK PASSED ---

    // 6. NOW you can do your actual Login Logic
    // e.g. Check database for email/password
    console.log(
      `User ${email} passed security check with score: ${googleData.riskAnalysis.score}`
    );

    return NextResponse.json(
      { status: true, message: "Login Successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// components/RecaptchaScript.js
import Script from "next/script";

const RecaptchaScript = () => {
  return (
    <Script
      strategy="afterInteractive"
      src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
    />
  );
};

export default RecaptchaScript;

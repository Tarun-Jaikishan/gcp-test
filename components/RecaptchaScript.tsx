// components/RecaptchaScript.js
import Script from "next/script";

const RecaptchaScript = () => {
  return (
    <Script
      strategy="afterInteractive"
      src="https://www.google.com/recaptcha/enterprise.js"
      async
      defer
    />
  );
};

export default RecaptchaScript;

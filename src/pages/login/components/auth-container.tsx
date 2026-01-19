import { useState } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { ForgotPasswordForm } from "./forgot-password-form";

export type AuthMode = "login" | "register" | "forgot-password";

export function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>("login");

  const renderForm = () => {
    switch (mode) {
      case "login":
        return <LoginForm onSwitchMode={setMode} />;
      case "register":
        return <RegisterForm onSwitchMode={setMode} />;
      case "forgot-password":
        return <ForgotPasswordForm onSwitchMode={setMode} />;
      default:
        return <LoginForm onSwitchMode={setMode} />;
    }
  };

  return renderForm();
}
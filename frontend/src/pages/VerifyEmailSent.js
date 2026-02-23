import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../auth/AuthLayout";
import Message from "../components/Message";

export default function VerifyEmailSent() {
  const [params] = useSearchParams();

  const expired = params.get("verified") === "expired";

  let email = null;

  try {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    email = userData?.email || null;
  } catch {
    email = null;
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={
        expired
          ? "Your verification link has expired."
          : "A verification link has been sent to your registered email address."
      }
    >
      {expired ? (
        <Message
          type="error"
          text="The verification link has expired. Please register again or request a new link."
        />
      ) : (
        <Message
          type="success"
          text={
            email
              ? `Verification link sent to ${email}. Please check your inbox.`
              : "Please check your inbox and click the verification link. After verifying, you can login."
          }
        />
      )}

      <div className="auth-footer">
        <Link className="link" to="/login">
          Go to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
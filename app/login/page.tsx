import { signInWithGitHub } from "@/app/login/actions";
import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string; status?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error, status } = await searchParams;

  return (
    <main className="auth-main">
      <section aria-labelledby="login-heading" className="auth-card">
        <p className="auth-eyebrow">Organizer access</p>
        <h1 id="login-heading">Sign in</h1>
        <p>Use your authorized GitHub account to access tournament management.</p>
        {error ? (
          <p className="auth-message auth-error" role="alert">
            {error === "AccessDenied"
              ? "This GitHub account is not authorized for organizer access."
              : "Sign-in could not be completed. Check your account and try again."}
          </p>
        ) : null}
        {status === "signedOut" ? (
          <p className="auth-message" role="status">
            You have signed out.
          </p>
        ) : null}
        <form action={signInWithGitHub}>
          <input name="callbackUrl" type="hidden" value={callbackUrl ?? "/organizer"} />
          <button className="auth-button" type="submit">
            Continue with GitHub
          </button>
        </form>
        <Link className="auth-home-link" href="/">
          Return to public page
        </Link>
      </section>
    </main>
  );
}

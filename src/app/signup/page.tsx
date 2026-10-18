import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return <div className="container-page pb-10"><AuthForm mode="signup" /></div>;
}

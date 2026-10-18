import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <div className="container-page pb-10"><AuthForm mode="login" next={next} /></div>;
}

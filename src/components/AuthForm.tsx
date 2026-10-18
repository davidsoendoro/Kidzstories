"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action] = useActionState(mode === "login" ? login : signup, undefined);
  return (
    <form action={action} className="card mx-auto mt-10 max-w-md space-y-4">
      <h1 className="text-3xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input className="input" id="name" name="name" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
      </div>
      {next && <input type="hidden" name="next" value={next} />}
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="One moment...">
        {mode === "login" ? "Log in" : "Create account"}
      </SubmitButton>
      <p className="text-center text-sm text-ink/60">
        {mode === "login" ? (
          <>New here? <Link className="font-semibold text-berry" href="/signup">Create an account</Link></>
        ) : (
          <>Already have an account? <Link className="font-semibold text-berry" href="/login">Log in</Link></>
        )}
      </p>
    </form>
  );
}

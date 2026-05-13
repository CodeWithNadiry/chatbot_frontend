"use client";

import { useActionState } from "react";
import { loginSchema } from "../../../lib/schemas/auth.schema";
import { useAuthStore } from "../../../store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

async function loginAction(login, router, prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      enteredValues: {
        email,
        password,
      },
    };
  }

  try {
    const res = await fetch(
      "https://chatbotbackend-production-dc6c.up.railway.app/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error("failed to login..");
    }

    login(data);

    router.push("/documents");
  } catch (error) {
    console.log(error);
  }
}

const Login = () => {
  const router = useRouter();

  const login = useAuthStore((state) => state.login);

  const [state, formAction, isPending] = useActionState(
    (prevState, formData) => loginAction(login, router, prevState, formData),
    {
      errors: null,
      enteredValues: null,
    },
  );

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>

        <p className="text-sm text-gray-500 mt-1">
          Login to continue to IntelliChat
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          defaultValue={state.enteredValues?.email || ""}
          className="
            w-full px-3 py-2.5
            border border-gray-200 rounded-lg
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#2D5BE3]/30
            focus:border-[#2D5BE3]
          "
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          defaultValue={state.enteredValues?.password || ""}
          className="
            w-full px-3 py-2.5
            border border-gray-200 rounded-lg
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#2D5BE3]/30
            focus:border-[#2D5BE3]
          "
        />

        {state.errors &&
          Object.entries(state.errors).map(([field, messages]) =>
            messages.map((msg, i) => (
              <p key={`${field}-${i}`} className="text-sm text-red-500">
                {msg}
              </p>
            )),
          )}

        <button
          disabled={isPending}
          className="
            w-full mt-1
            bg-[#2D5BE3]
            text-white
            py-2.5
            rounded-lg
            text-sm font-medium
            hover:opacity-90
            transition
            disabled:opacity-60
            cursor-pointer
          "
        >
          {isPending ? "Logging..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#2D5BE3] font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
};

export default Login;

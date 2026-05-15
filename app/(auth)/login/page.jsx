"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authAPI } from "../../../lib/api/auth.api";
import { useAuthStore } from "../../../store/useAuthStore";
import { loginSchema } from "../../../lib/schemas/auth.schema";

const Login = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const mutation = useMutation({
    mutationFn: authAPI.login,

    onSuccess: (data) => {
      login(data);
      router.push("/documents");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = loginSchema.safeParse(payload);

    if (!result.success) return;

    mutation.mutate(payload);
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Welcome back</h2>
        <p className="text-sm text-gray-500">Login to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="email" placeholder="Email" className="input" />
        <input name="password" type="password" placeholder="Password" className="input" />

        <button disabled={mutation.isPending}>
          {mutation.isPending ? "Logging..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-600">
          Create one
        </Link>
      </p>
    </>
  );
};

export default Login;
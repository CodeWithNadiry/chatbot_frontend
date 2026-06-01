"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "../../../store/useAuthStore";
import { loginSchema } from "../../../lib/schemas/auth.schema";
import { authAPI } from "../../../lib/schemas/api/auth.api";

const Login = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formError, setFormError] = useState(null);

  const mutation = useMutation({
    mutationFn: authAPI.login,

    onSuccess: (data) => {
      login(data);
      router.push("/documents");
    },

    onError: (err) => {
      setFormError(
    err?.response?.data?.message || // backend message
    err?.message ||  // Axios error message
    "Login failed"
  );
  },
});

  //   Typical Axios Error Structure
  // {
  //   message: "Request failed with status code 401",
  //   response: {
  //     status: 401,
  //     data: {
  //       message: "Invalid email or password"
  //     }
  //   }
  // }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.target);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = loginSchema.safeParse(payload);

    // if validation pass:
    // {
    // success: true,
    // data: {
    //   email: "usman@gmail.com",
    //   password: "123456"
    // }
    // }

    if (!result.success) {
      setFormError("Invalid email or password format");
      return;
    }

    // If validation failed:
    // {
    //   success: false,
    //   error: ...
    // }

    mutation.mutate(payload);
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">
          Login to continue to IntelliChat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
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
          className="
            w-full px-3 py-2.5
            border border-gray-200 rounded-lg
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#2D5BE3]/30
            focus:border-[#2D5BE3]
          "
        />

        {/* ERROR UI */}
        {formError && <p className="text-sm text-red-500">{formError}</p>}

        <button
          disabled={mutation.isPending}
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
          {mutation.isPending ? "Logging..." : "Login"}
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

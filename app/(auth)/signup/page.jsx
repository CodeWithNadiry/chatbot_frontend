"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signupSchema } from "../../../lib/schemas/auth.schema";
import { authAPI } from "../../../lib/schemas/api/auth.api";

const Signup = () => {
  const router = useRouter();

  const [userInputs, setUserInputs] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: authAPI.signup,
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err) => {
      setError(err?.response?.data?.message || "Signup failed");
    },
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setUserInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const result = signupSchema.safeParse(userInputs);

    if (!result.success) return;

    setError(null);
    mutation.mutate(userInputs);
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Create account
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Start using IntelliChat in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={userInputs.name}
          onChange={handleChange}
          className="
            w-full px-3 py-2.5
            border border-gray-200 rounded-lg
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#2D5BE3]/30
            focus:border-[#2D5BE3]
            transition
          "
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userInputs.email}
          onChange={handleChange}
          className="
            w-full px-3 py-2.5
            border border-gray-200 rounded-lg
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#2D5BE3]/30
            focus:border-[#2D5BE3]
            transition
          "
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={userInputs.password}
          onChange={handleChange}
          className="
            w-full px-3 py-2.5
            border border-gray-200 rounded-lg
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#2D5BE3]/30
            focus:border-[#2D5BE3]
            transition
          "
        />

        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}

        <button
          disabled={mutation.isPending}
          className="
            w-full mt-2
            bg-[#2D5BE3]
            text-white
            py-2.5
            rounded-lg
            text-sm font-medium
            hover:opacity-90
            active:scale-[0.99]
            transition
            disabled:opacity-60
            cursor-pointer
          "
        >
          {mutation.isPending ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-5">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#2D5BE3] font-medium hover:underline"
        >
          Login
        </Link>
      </p>
    </>
  );
};

export default Signup;
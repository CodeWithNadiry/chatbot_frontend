"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authAPI } from "../../../lib/api/auth.api";
import { signupSchema } from "../../../lib/schemas/auth.schema";

const Signup = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: authAPI.signup,

    onSuccess: () => {
      router.push("/login");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const result = signupSchema.safeParse(payload);

    if (!result.success) return;

    mutation.mutate(payload);
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Create account</h2>
        <p className="text-sm text-gray-500">Start using IntelliChat</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" placeholder="Name" className="input" />
        <input name="email" placeholder="Email" className="input" />
        <input name="password" type="password" placeholder="Password" className="input" />

        <button disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Signup"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </>
  );
};

export default Signup;
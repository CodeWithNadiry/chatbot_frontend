"use client";

import { useState } from "react";
import { signupSchema } from "../../../lib/schemas/auth.schema";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const [userInputs, setUserInputs] = useState({
    name: "",
    email: "",
    password: "",
  });

  const inputs = [
    {
      type: "text",
      name: "name",
      placeholder: "Name",
      value: userInputs.name,
    },
    {
      type: "email",
      name: "email",
      placeholder: "Email",
      value: userInputs.email,
    },
    {
      type: "password",
      name: "password",
      placeholder: "Password",
      value: userInputs.password,
    },
  ];

  function handleChange(e) {
    const { name, value } = e.target;

    setUserInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const result = signupSchema.safeParse({
      ...userInputs,
    });

    if (!result.success) {
      console.log(result.error.flatten());
    }

    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          ...userInputs,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      router.push("/login");
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create account</h2>

        <p className="text-sm text-gray-500 mt-1">
          Start using IntelliChat in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {inputs.map((input, i) => (
          <input
            key={i}
            name={input.name}
            type={input.type}
            placeholder={input.placeholder}
            value={input.value}
            onChange={handleChange}
            className="
              w-full px-3 py-2.5
              border border-gray-200 rounded-lg
              text-sm
              bg-white
              outline-none
              focus:ring-2 focus:ring-[#2D5BE3]/30
              focus:border-[#2D5BE3]
              transition
            "
          />
        ))}

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <button
          disabled={isLoading}
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
          {isLoading ? "Creating..." : "Create Account"}
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

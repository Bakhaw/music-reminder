"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const FormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have than 8 characters"),
});

function Signin() {
  const router = useRouter();
  const params = useSearchParams();
  const emailFromURL = params.get("email");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: emailFromURL ?? "",
      password: "",
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const signInData = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInData?.error) {
      form.setError("email", { message: "Email or password is wrong" });
      form.setError("password", { message: "Email or password is wrong" });
    } else {
      router.refresh();
      router.push("/");
    }
  };

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6 p-12 border border-red-300 text-black">
          <h1 className="text-white text-center">SIGN IN</h1>

          <div>
            <input
              className="w-full"
              type="email"
              placeholder="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              className="w-full"
              autoFocus={Boolean(emailFromURL)}
              type="password"
              placeholder="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button className="border border-red-300 text-white" type="submit">
            Submit
          </button>
        </div>
      </form>
      <p>
        Don&apos;t have an account ?{" "}
        <Link href="/sign-up" className="text-red-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default Signin;

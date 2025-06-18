"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

const FormSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must have at least 3 characters")
      .max(100, "Username max length is 100 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must have at least 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
  });

function Signup() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  const { mutate: signUpMutation, isPending } = useMutation<
    unknown,
    { field: keyof z.infer<typeof FormSchema>; message: string },
    z.infer<typeof FormSchema>
  >({
    mutationFn: async (values: z.infer<typeof FormSchema>) => {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          username: values.username.toLowerCase(),
          password: values.password,
        }),
      });

      const json = await response.json();

      if (response.status === 409) {
        throw { field: json.field, message: json.message };
      }

      if (response.status !== 201) {
        throw new Error("Unexpected server error");
      }

      return json;
    },
    onSuccess: () => {
      router.push("/sign-in");
    },
    onError: (error) => {
      if (error.message) {
        form.setError(error.field, { message: error.message });
      }
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    await signUpMutation(values);
  }

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6 p-12 border border-red-300 text-black">
          <h1 className="text-white text-center">SIGN UP</h1>

          <div>
            <Input
              type="text"
              placeholder="username"
              disabled={isPending}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Input
              type="email"
              placeholder="email"
              disabled={isPending}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="password"
              {...register("password")}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="confirmPassword"
              disabled={isPending}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button variant="secondary" type="submit" disabled={isPending}>
            Submit
          </Button>
        </div>
      </form>
      <p>
        Already have an account?{" "}
        <Link href="/sign-in" className="text-red-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Signup;

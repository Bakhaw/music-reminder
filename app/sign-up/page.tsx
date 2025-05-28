"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
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
        form.setError(json.field, { message: json.message });
      }

      // todo show an alert to tell the user his account is successfully created
      if (response.status === 201) {
        router.push(`/sign-in?email=${values.email}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6 p-12 border border-red-300 text-black">
          <input type="text" placeholder="username" {...register("username")} />
          {errors.username && (
            <p className="text-red-500">{errors.username.message}</p>
          )}

          <input {...register("email")} type="email" placeholder="email" />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          <input
            type="password"
            placeholder="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <input
            type="password"
            placeholder="confirmPassword"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}

          <button className="border border-red-300 text-white" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signup;

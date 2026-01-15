"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

const FormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have than 8 characters"),
});

function Signin() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  const { mutate: signInMutation, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof FormSchema>) => {
      const signInData = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!signInData || signInData.error) {
        throw new Error("Email or password is wrong");
      }

      return signInData;
    },
    onSuccess: () => {
      router.refresh();
      router.push("/");
    },
    onError: () => {
      form.setError("email", { message: "Email or password is wrong" });
      form.setError("password", { message: "Email or password is wrong" });
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    await signInMutation(values);
  }

  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Music Reminder 💜</CardTitle>

          <CardDescription>
            Welcome back! Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div>
                <Input
                  type="email"
                  placeholder="email"
                  disabled={isPending}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="password"
                  disabled={isPending}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button className="w-full" type="submit" disabled={isPending}>
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default Signin;

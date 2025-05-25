import { useRouter } from "next/navigation";

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

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

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

      if (json.status === 409) {
        form.setError(json.field, { message: json.message });
        setIsLoading(false);
      }

      // todo show an altert to tell the user his account is successfully created
      if (json.status === 201) {
        router.push(`/sign-in?email=${values.email}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return <form></form>;
}

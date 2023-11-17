"use client";

import { UserNameRequest, UserNameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import useCustomToast from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

type UserNameFormProps = {
  user: Pick<User, "id" | "username"> | null;
};

const UserNameForm = ({ user }: UserNameFormProps) => {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UserNameRequest>({
    resolver: zodResolver(UserNameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { loginToast } = useCustomToast();

  const { mutate: changeUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UserNameRequest) => {
      const payload: UserNameRequest = { name };
      const { data } = await axios.patch(`api/username`, payload);

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        switch (err.response?.status) {
          case 409:
            return toast({
              title: "Username already exist.",
              description: "Please choose another.",
              variant: "destructive",
            });
          case 401:
            return loginToast();
          case 422:
            return toast({
              title: "Invalid username",
              description:
                "Please choose a name between 3 and 32 characters, using only letters, numbers and underscores",
              variant: "destructive",
            });
          default:
            return toast({
              title: "Something went wrong.",
              description: "Please try again in a few seconds.",
              variant: "destructive",
            });
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Username successfully updated.",
        variant: "default",
      });
      router.refresh();
    },
  });
  return (
    <form
      onSubmit={handleSubmit((e) => {
        changeUsername(e);
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>Enter here your new username:</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              Username
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Change username</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserNameForm;

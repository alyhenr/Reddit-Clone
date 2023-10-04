"use client";

import React, { useState } from "react";

import { signIn } from "next-auth/react";

import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const AuthForm = ({ className, ...props }: AuthFormProps) => {
  const [submtting, setSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setSubmitting(true);
    try {
      await signIn("google");
    } catch (e) {
      //toast notifcation
      toast({
        title: "There was a problemn when logging in.",
        description: "Google authentication failed.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        onClick={loginWithGoogle}
        isLoading={submtting}
        disabled={submtting}
        size="sm"
        className="w-full"
      >
        {!submtting && <Icons.google className="h-4 w-4 mr-2" />}
        Google
      </Button>
    </div>
  );
};

export default AuthForm;

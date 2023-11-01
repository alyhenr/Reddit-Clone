"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import UserAvatar from "./UserAvatar";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { ImageIcon, Link2 } from "lucide-react";

type MiniCreatePostProps = {
  session: Session | null;
};

const MiniCreatePost = ({ session }: MiniCreatePostProps) => {
  const router = useRouter();
  const pathName = usePathname();

  return session?.user ? (
    <li className="overflow-hidden rounded-md bg-white shadow">
      <div className="h-full px-6 py-4 flex flex-col items-start sm:flex-row justify-between gap-6">
        <div className="relative">
          <UserAvatar
            user={{
              name: session.user.name,
              image: session.user.image,
            }}
          />
          <span className="absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white" />
        </div>
        <Input
          readOnly
          onClick={() => router.push(pathName + "/submit")}
          placeholder="Create post"
        />

        <div className="flex gap-2">
          <Button
            onClick={() => router.push(pathName + "/submit")}
            variant="ghost"
          >
            {" "}
            <ImageIcon className="text-zinc-600" />
          </Button>
          <Button
            onClick={() => router.push(pathName + "/submit")}
            variant="ghost"
          >
            <Link2 className="text-zinc-600" />
          </Button>
        </div>
      </div>
    </li>
  ) : (
    <></>
  );
};

export default MiniCreatePost;

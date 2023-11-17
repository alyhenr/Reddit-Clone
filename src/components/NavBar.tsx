import React from "react";
import Link from "next/link";

import { Icons } from "./Icons";
import { getAuthSession } from "@/lib/auth";

import UserIconNav from "./UserIconNav";
import SearchBar from "./SearchBar";

const NavBar = async () => {
  const session = await getAuthSession();
  return (
    <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-10 py-2">
      <div className="container max-w-7xl h-ful mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="w-8 h-8 sm:w-6 sm:h-6" color="orange" />
          <p className="hidden text-zinc-700 text-sm font-medium md:block">
            Brodit
          </p>
        </Link>

        <SearchBar />

        {session ? (
          <UserIconNav user={session.user} />
        ) : (
          <Link href="sign-in">Sign In</Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;

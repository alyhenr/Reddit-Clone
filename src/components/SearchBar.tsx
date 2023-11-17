"use client";

import React, { useCallback, useState } from "react";
import { Command, CommandInput } from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";

const SearchBar = () => {
  const router = useRouter();

  const [input, setInput] = useState<string>("");

  const {
    data: foundCommunities,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["search-query"],
    enabled: false,
    queryFn: async () => {
      if (input.length === 0) return [];

      const { data } = await axios.get(`/api/search?q=${input}`);

      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
  });

  const request = debounce(() => {
    refetch();
  }, 500);

  const debounceRequest = useCallback(() => {
    request();
  }, []);

  return (
    <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search communities..."
      />
      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(foundCommunities?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {foundCommunities?.map((subreddit) => (
                <CommandItem
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(`/r/${e}`);
                      router.refresh();
                    }
                  }}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  key={subreddit.id}
                  value={subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;

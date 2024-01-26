import FriendRequestSidebarOption from "@/components/FriendRequestSidebarOption";
import { Icon, Icons } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";
import { fetchRedis } from "@/helper/redis";
import { authOptions } from "@/lib/auth";
import { IconNode, LucideIcon, UserPlus, Aperture } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface layoutProps {
  children: ReactNode;
}

interface SidebarOption {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add Friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const layout = async ({ children }: layoutProps) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const unseenRequestCount = (
    (await fetchRedis(
      "smembers",
      `user:${session.user.id}:incoming_friend_request`
    )) as unknown as User[]
  ).length;

  return (
    <div className="w-full flex h-screen ">
      <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white p-6">
        {" "}
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
          <svg className="h-8 w-auto text-indigo-500" viewBox="0 0 2000 2000">
            <path
              fill="currentColor"
              d="m1976.678 964.142-1921.534-852.468c-14.802-6.571-32.107-3.37-43.577 8.046-11.477 11.413-14.763 28.703-8.28 43.532l365.839 836.751-365.839 836.749c-6.483 14.831-3.197 32.119 8.28 43.532 7.508 7.467 17.511 11.417 27.677 11.417 5.37 0 10.785-1.103 15.9-3.371l1921.533-852.466c14.18-6.292 23.322-20.349 23.322-35.861.001-15.514-9.141-29.571-23.321-35.861zm-1861.042-739.791 1664.615 738.489h-1341.737zm321.069 816.954h1334.219l-1655.287 734.35z"
            />
          </svg>
        </Link>
        <div className=" text-xs font-semibold leading-6 text-gray-400">
          Your chats
        </div>
        <nav className="flex flex-1 flex-col ">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>// chats are here</li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 ">
                Overview
              </div>
              <ul role="list " className="-mx-2 mt-2 space-y-1 ">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className=" text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold "
                      >
                        <span className=" text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li>
              <FriendRequestSidebarOption
                sessionId={session.user.id}
                initialUnseenRequestCount={unseenRequestCount}
              />
            </li>

            <li className="-mx-6 mt-auto flex items-center ">
              <div className=" flex flex-1 items-center gap-x-4 px-6 py-3 test-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  {" "}
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ""}
                    alt="Profile Pic"
                  />
                </div>

                <span className="sr-only"> Your Profile</span>
                <div className="flex flex-col ">
                  <span aria-hidden="true">{session.user.name}</span>
                  <span className="text-xs text-zinc-400 " aria-hidden="true">
                    {" "}
                    {session.user.email}
                  </span>
                </div>
              </div>
              <SignOutButton className="h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default layout;

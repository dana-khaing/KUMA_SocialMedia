"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBell,
  faUser,
  faRss,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function NavItem() {
  const { user } = useUser();
  const userId = user?.id;
  const pathname = usePathname();

  // Define routes
  const routes = {
    home: "/",
    friendlist: "/friendlist",
    studio: "/studio",
    profile: userId ? `/profile/${userId}` : "/profile",
    activity: "/activity",
  };

  return (
    <div>
      <div className="items-center gap-2 hidden md:flex justify-around">
        <Link
          href="/"
          className={`flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl ${
            pathname === routes.home ? "bg-[#FF4E02] text-white" : ""
          }`}
        >
          <FontAwesomeIcon
            alt="home"
            className="w-6 h-6 text-center items-center justify-center"
            icon={faHouse}
            size="lg"
          />
        </Link>
        <Link
          href="/friendlist"
          className={`flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl ${
            pathname === routes.friendlist ? "bg-[#FF4E02] text-white" : ""
          }`}
        >
          <FontAwesomeIcon
            className="w-[1.75rem] h-[1.75rem]"
            icon={faUserGroup}
            size="lg"
          />
        </Link>
        <Link
          href="/studio"
          className={`flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl ${
            pathname === routes.studio ? "bg-[#FF4E02] text-white" : ""
          }`}
        >
          <FontAwesomeIcon
            className="w-[1.75rem] h-[1.75rem] text-sm"
            icon={faRss}
            size="lg"
          />
        </Link>
        <Link
          href={`/profile/${userId}`}
          className={`flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl ${
            pathname === routes.profile ? "bg-[#FF4E02] text-white" : ""
          }`}
        >
          <FontAwesomeIcon className="w-6 h-6" icon={faUser} size="lg" />
        </Link>
        <Link
          href="/activity"
          className={`flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl ${
            pathname === routes.activity ? "bg-[#FF4E02] text-white" : ""
          }`}
        >
          <FontAwesomeIcon className="w-6 h-6" icon={faBell} size="lg" />
        </Link>
      </div>
    </div>
  );
}

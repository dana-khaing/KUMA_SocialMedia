import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
export default async function NavItem() {
  const userId = (await auth()).userId;
  return (
    <div>
      {userId != null ? (
        <div className=" items-center gap-2 hidden md:flex justify-around">
          <Link
            href={"/"}
            className="flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
          >
            <FontAwesomeIcon
              alt="home"
              className="w-6 h-6 text-center items-center justify-center"
              icon={faHouse}
              size="lg"
            />
          </Link>
          <Link
            href={"/"}
            className="flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
          >
            <FontAwesomeIcon
              className="w-[1.75rem] h-[1.75rem]"
              icon={faUserGroup}
              size="lg"
            />
          </Link>
          <Link
            href={"/"}
            className="flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
          >
            <FontAwesomeIcon
              className="w-[1.75rem] h-[1.75rem]"
              icon={faCirclePlay}
              size="lg"
            />
          </Link>

          <Link
            href={"/"}
            className="flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
          >
            <FontAwesomeIcon className="w-6 h-6" icon={faUser} size="lg" />
          </Link>

          <Link
            href={"/"}
            className="flex w-28 h-12 items-center shadow justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
          >
            <FontAwesomeIcon className="w-6 h-6" icon={faBell} size="lg" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

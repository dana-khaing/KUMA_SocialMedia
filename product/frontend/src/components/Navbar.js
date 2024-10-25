import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Authui from "./authui.js";
export default function Navbar() {
  return (
    <div className="flex h-20 pr-4 pl-4 border-solid rounded-3xl border-2 round bg-slate-100">
      {/* start */}
      <div className="w-[30%] flex-shrink-0 ">
        <Link
          href={"/"}
          className=" w-full h-full items-start justify-center md:shrink-0"
        >
          <img
            src="/logo.svg"
            className="w-36 h-full items-center justify-center shrink-0"
            alt="Kuma"
          />
        </Link>
      </div>{" "}
      {/* mid */}
      <div className=" items-center gap-1 w-[40%] hidden md:flex justify-around">
        <Link
          href={"/"}
          className="flex w-28 h-12 items-center justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
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
          className="flex w-28 h-12 items-center justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
        >
          <FontAwesomeIcon className="w-6 h-6" icon={faUser} size="lg" />
        </Link>
        <Link
          href={"/"}
          className="flex w-28 h-12 items-center justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
        >
          <FontAwesomeIcon
            className="w-[1.75rem] h-[1.75rem]"
            icon={faUserGroup}
            size="lg"
          />
        </Link>

        <Link
          href={"/"}
          className="flex w-28 h-12 items-center justify-center mt-4 mb-4 text-[#FF4E01] hover:bg-[#FF4E01] hover:text-white rounded-3xl"
        >
          <FontAwesomeIcon className="w-6 h-6" icon={faBell} size="lg" />
        </Link>
      </div>{" "}
      {/* end */}
      <div className="w-[30%] pr-2 items-center hidden md:flex justify-end">
        <Authui />
      </div>
    </div>
  );
}

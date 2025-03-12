import Link from "next/link";
import NavItem from "./navitem.js";
import Useravator from "./useravator.js";
import NavitemMobile from "./navitemMobile.js";
import SearchUser from "@/components/home/searchUser.js";

import { SignedIn, SignedOut } from "@clerk/nextjs";
export default async function Navbar() {
  return (
    <div className="flex w-full h-20 pr-4 pl-4 border-t-0 border-solid border-opacity-10 rounded-b-3xl border-[1px] bg-slate-50 border-[#FF4E01] mb-5">
      {/* start */}
      <div className="w-[30%] md:w-[30%] flex-shrink-0">
        <Link
          href={"/"}
          className="w-full h-full items-start justify-center md:shrink-0"
        >
          <img
            src="/kuma.svg"
            className="w-36 h-full items-center justify-center rounded-full shrink-0"
            alt="Kuma"
          />
        </Link>
      </div>{" "}
      {/* mid */}
      <div className="w-0 md:w-[40%] items-center">
        <SignedIn>
          <NavItem />
        </SignedIn>
        <SignedOut></SignedOut>
      </div>
      {/* end */}
      <div className="w-[70%] md:w-[30%] items-center flex gap-2 justify-end">
        <Useravator />
        <div className="flex lg:hidden text-[#FF4E02] justify-center items-center p-2">
          <SearchUser />
        </div>
        <NavitemMobile />
      </div>
    </div>
  );
}

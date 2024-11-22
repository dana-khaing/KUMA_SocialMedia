import Link from "next/link";
import NavItem from "./navitem.js";
import Useravator from "./useravator.js";
import NavitemMobile from "./navitemMobile.js";
import { currentUser } from "@clerk/nextjs/server";
export default async function Navbar() {
  const user = await currentUser();
  return (
    <div className="flex w-full h-20 pr-4 pl-4 border-t-0 border-solid border-opacity-10 rounded-b-3xl border-[1px] bg-slate-50 border-[#FF4E01] mb-5">
      {/* start */}
      <div className="w-[50%] md:w-[30%] flex-shrink-0">
        <Link
          href={"/"}
          className="w-full h-full items-start justify-center md:shrink-0"
        >
          <img
            src="/logo.svg"
            className="w-36 h-full items-center justify-center hover:bg-slate-300 rounded-full shrink-0"
            alt="Kuma"
          />
        </Link>
      </div>{" "}
      {/* mid */}
      <div className="w-[40%] items-center">
        <NavItem user={user} />
      </div>
      {/* end */}
      <div className="w-[50%] md:w-[30%] items-center flex justify-end">
        <Useravator />
        <NavitemMobile user={user} />
      </div>
    </div>
  );
}

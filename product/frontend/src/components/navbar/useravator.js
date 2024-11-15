import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default async function Useravator() {
  return (
    <div className="text-[#FF4E01] flex w-fit items-center justify-end cursor-default">
      <SignedIn>
        <div className="flex gap-2 w-fit h-12 px-4 text-center justify-center items-center ">
          <UserButton
            showName={true}
            appearance={{
              elements: {
                avatarBox:
                  "w-[2.225rem] h-[2.225rem] border-solid border-[1px] border-[#FF4E01] hover:border-white  ",
                // name: "text-lg font-bold text-[#FF4E01] hover:text-white",
                button:
                  " text-[#ff4e02] text-sm hover:text-white px-4 py-2 border-0§ rounded-full hover:bg-[#FF4E01] hover:text-white",
              },
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <Link
          href="sign-in"
          className="hidden md:flex w-44 h-12 text-center  justify-center items-center rounded-full bg-[#ff4e02] text-white"
        >
          <span>
            <FontAwesomeIcon
              className="w-6 h-6 pr-3"
              icon={faRightToBracket}
              size="lg"
            />
          </span>
          <span className="text-center">Login</span> <span>/</span>{" "}
          <span>Register</span>
        </Link>
      </SignedOut>
    </div>
  );
}

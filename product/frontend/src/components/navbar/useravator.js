import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Useravator() {
  const userId = (await auth()).userId;
  const user = await currentUser();

  return (
    <div className="text-[#FF4E01] flex w-fit items-center justify-end cursor-default">
      {userId != null ? (
        <div className="flex gap-2 w-fit h-12 px-4 text-center justify-center items-center rounded-full hover:bg-[#FF4E01] hover:text-white">
          <span className="text-base ml-3 font-semibold hidden sm:block">
            {user?.username?.toUpperCase() || user?.fullName || "Kuma User"}
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-[2.225rem] h-[2.225rem] border-solid border-[1px] border-[#FF4E01] hover:border-white ",
              },
            }}
          />
        </div>
      ) : (
        <Link
          href="sign-in"
          className="hidden md:flex w-44 h-12 text-center bg-inherit text-[#FF4E01] justify-center items-center rounded-full hover:bg-[#ff4d01d4] hover:text-white"
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
      )}
    </div>
  );
}

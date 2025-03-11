import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Useravator() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  // fetch user name from prisma db
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return (
    <div className="text-[#FF4E01] flex w-fit items-center justify-end cursor-default">
      <SignedIn>
        <div className="flex gap-2 w-fit h-14 text-center text-[#FF4E01] text-sm justify-center items-center border-solid border-transparent border-0 rounded-full">
          <span className="flex flex-shrink-0">
            {user?.name} {user?.surname}
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-[2.225rem] h-[2.225rem] border-solid border-[1px] border-[#FF4E01] hover:border-white  ",
              },
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <Link
          href="sign-in"
          className="hidden md:flex w-44 h-12 text-center justify-center items-center rounded-full bg-[#ff4e02] text-white"
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

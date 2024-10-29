import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function Authui() {
  const userId = (await auth()).userId;
  const user = await currentUser();

  return (
    <div className="text-[#FF4E01] flex w-full items-center justify-end ">
      {userId != null ? (
        <div className="flex gap-3 w-44 h-12 text-center justify-center items-center rounded-full hover:bg-[#FF4E01] hover:text-white">
          <span className="text-base ml-3 font-semibold hidden sm:block">
            {/* {user?.username || user?.fullName || "Kuma User"} can use user name to display */}
            {user?.fullName || "Kuma User"}
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
        <Button className="hidden md:flex w-44 h-12 text-center bg-inherit text-[#FF4E01] justify-center items-center rounded-full hover:bg-[#FF4E01] hover:text-white">
          <span>
            <FontAwesomeIcon
              className="w-6 h-6 pr-3"
              icon={faRightToBracket}
              size="lg"
            />
          </span>
          <span className="text-center">Login</span> <span>/</span>{" "}
          <span>Register</span>
        </Button>
      )}
    </div>
  );
}

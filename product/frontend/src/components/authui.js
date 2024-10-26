import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export default async function Authui() {
  const userId = await auth();
  return (
    <div className="text-[#FF4E01] flex w-full items-center justify-end">
      {userId ? (
        <UserButton />
      ) : (
        <div className="flex w-44 h-12 text-center justify-center items-center rounded-full hover:bg-[#FF4E01] hover:text-white">
          <span>
            <FontAwesomeIcon
              className="w-6 h-6 pr-3"
              icon={faRightToBracket}
              size="lg"
            />
          </span>
          <span className="text-center">Login</span> <span>/</span>{" "}
          <span>Register</span>
        </div>
      )}
    </div>
  );
}

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHouse } from "@fortawesome/free-solid-svg-icons";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faUser, faSearch } from "@fortawesome/free-solid-svg-icons";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { SignedIn } from "@clerk/nextjs";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import SearchUser from "../home/searchUser";
import { auth } from "@clerk/nextjs/server";

import Link from "next/link";

export const NavitemMobile = async () => {
  const { userId } = await auth();
  return (
    <SignedIn className="lg:hidden">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="flex lg:hidden flex-shrink-0 items-center justify-center w-10 h-10 shadow rounded-full text-[#FF4E01] bg-white">
          <FontAwesomeIcon icon={faBars} size="lg" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[15rem] bg-white rounded-2xl shadow-lg mt-5 mr-5 p-4">
            <Link className="max-w-full" href="/">
              <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <FontAwesomeIcon
                  icon={faHouse}
                  size="md"
                  className="mr-2 text-[#FF4E02]"
                />
                Home
              </DropdownMenu.Item>
            </Link>
            <DropdownMenu.Separator className="my-1 border-t border-gray-200" />
            <Link href={`/profile/${userId}`}>
              <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <FontAwesomeIcon
                  icon={faUser}
                  size="md"
                  className="mr-2 text-[#FF4E02]"
                />
                Profile
              </DropdownMenu.Item>
            </Link>
            <DropdownMenu.Separator className="my-1 border-t border-gray-200" />{" "}
            <Link href="/friendlist">
              <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <FontAwesomeIcon
                  icon={faUserCheck}
                  size="md"
                  className="mr-2 text-[#FF4E02]"
                />
                Friends
              </DropdownMenu.Item>
            </Link>
            <DropdownMenu.Separator className="my-1 border-t border-gray-200" />
            <Link href="/studio">
              <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <FontAwesomeIcon
                  icon={faCirclePlay}
                  size="md"
                  className="mr-2 text-[#FF4E02]"
                />
                Video
              </DropdownMenu.Item>
            </Link>
            <DropdownMenu.Separator className="my-1 border-t border-gray-200" />
            <Link href="/activity">
              <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 cursor-pointer ">
                <FontAwesomeIcon
                  icon={faBell}
                  size="md"
                  className="mr-2 text-[#FF4E02]"
                />
                Notification
              </DropdownMenu.Item>
            </Link>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </SignedIn>
  );
};
export default NavitemMobile;

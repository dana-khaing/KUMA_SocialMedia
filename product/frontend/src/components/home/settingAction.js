"use client";
import { useClerk } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faCog } from "@fortawesome/free-solid-svg-icons";

export const SettingAction = () => {
  const { openUserProfile } = useClerk();
  const handleEditProfile = () => {
    openUserProfile();
  };
  return (
    <div>
      <Button
        onClick={handleEditProfile}
        className="flex flex-grow  h-fit items-center bg-transparent text-base shadow-md w-full text-black hover:bg-[#FF4E02] hover:text-white py-4 px-8 rounded-xl justify-start"
      >
        <FontAwesomeIcon icon={faCog} size="md" />
        <span className="flex flex-1">Setting</span>
      </Button>
    </div>
  );
};
export default SettingAction;

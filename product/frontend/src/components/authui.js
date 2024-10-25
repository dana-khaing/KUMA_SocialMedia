import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";

export default function Authui() {
  return (
    <div className="text-[#FF4E01] flex w-full items-center justify-end">
      <div className="flex w-44 h-12 text-center justify-center items-center i rounded-full hover:bg-[#FF4E01] hover:text-white">
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
    </div>
  );
}

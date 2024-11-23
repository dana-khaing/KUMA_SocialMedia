import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCakeCandles } from "@fortawesome/free-solid-svg-icons";

const Birthday = () => {
  return (
    <div className=" w-full bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Birthday Celebrations </span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mx-auto"
      />
      {/* Birthday lists */}
      <div className="h-fit overflow-y-scroll scrollbar-hide flex flex-col gap-4 mt-2 px-2 py-2">
        {/* Birthday card */}
        <div className="flex gap-2 px-2 pb-2 items-center">
          <FontAwesomeIcon
            icon={faCakeCandles}
            size="2xl"
            className="text-[#FF4E01]"
          />
          <span className="text-xs flex-grow line-clamp-2">
            <span className=" font-bold">Naing Lynn, Hein Htet Aung</span> has
            their birthdays today, 🎉 Let's celebrate Kuma.🎉{" "}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Birthday;

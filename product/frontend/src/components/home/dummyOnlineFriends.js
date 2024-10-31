export const DummyOnlineFriends = () => {
  return (
    <div className="flex items-center hover:bg-slate-200 p-2 rounded-xl">
      <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
        <img
          src="/stories1.jpg"
          alt="profile"
          className="w-9 h-9 rounded-full ring-1 ring-[#FF4E01]"
        />
      </div>
      <div className="flex flex-col flex-grow cursor-pointer">
        <span className="text-black text-sm line-clamp-1">Naing lynn</span>
        <span className="text-gray-500 text-xs line-clamp-1">
          2 mutual friends
        </span>
      </div>
      {/* active status */}
      <div className=" p-3 flex gap-2 justify-end items-center">
        <div className="w-2 h-2 bg-[#00FF00] rounded-full"></div>
        <span className="text-[#00FF00]">Online</span>
      </div>
    </div>
  );
};
export default DummyOnlineFriends;

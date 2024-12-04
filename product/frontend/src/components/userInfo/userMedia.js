import { Separator } from "@radix-ui/react-separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import prisma from "@/lib/client";

export const UserMedia = async ({ user }) => {
  const postWithMedia = await prisma.post.findMany({
    where: {
      userId: user?.id,
      image: {
        not: null,
      },
    },
    take: 7,
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className=" w-full h-[20rem] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col py-2 cursor-default">
      <div className="flex items-center px-4  ">
        <div className="text-sm text-[#ff4e02] py-2">Gallery </div>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mx-auto"
      />
      {/* use grid of 4 /4 to show photo */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 px-4 py-4">
        {" "}
        {postWithMedia.length ? (
          postWithMedia.map((post) => (
            <img
              key={post.id}
              src={post.image}
              alt="gallery"
              className="w-full h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out"
            />
          ))
        ) : (
          <div className="text-[#ff4e02] text-center w-full col-span-4 row-span-2 flex items-center justify-center ">
            No media to show
          </div>
        )}
        {postWithMedia.length == 7 && (
          <div className=" h-28 bg-gray-300 rounded-2xl object-cover hover:scale-105 transition-transform duration-500 ease-out justify-center items-center flex">
            <FontAwesomeIcon
              icon={faEllipsis}
              size="2x"
              className="text-[#FF4E01]"
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default UserMedia;

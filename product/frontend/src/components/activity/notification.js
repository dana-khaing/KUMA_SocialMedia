import { Separator } from "@radix-ui/react-dropdown-menu";
import { auth } from "@clerk/nextjs/server";

export const Notification = async () => {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }
    // get notification
    const notification = await prisma.notification.findMany({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return (
    <div className=" w-full h-[120vh] bg-slate-50 rounded-2xl shadow-md text-sm border-[1px] flex-shrink-0 flex-col pt-4 cursor-default ">
      <div className="flex items-center justify-between px-4">
        <span className="text-[#FF4E01]">Notification</span>
      </div>
      <Separator
        orientation="horizontal"
        className="bg-[#FF4E01] h-[0.05rem] w-[95%] mt-2 mb-2 mx-auto"
      />
      {/* Notification container */}
      <div className="h-[110vh] overflow-y-scroll scrollbar-hide flex flex-col gap-1 px-4">
        <div className="flex items-center hover:bg-slate-200 gap-2 p-4 rounded-xl">
          <div className="flex-shrink-0  rounded-full bg-white items-center justify-center mr-2">
            <img
              src="/stories1.jpg"
              alt="profile"
              className="w-10 h-10 rounded-full ring-1 ring-[#FF4E01]"
            />
          </div>
          <span className="text-md flex-grow line-clamp-2">
            <span className=" font-bold">
              Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit Sed Do
              Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua Ut Enim
              Ad Minim Veniam Quis Nostrud Exercitation Ullamco Laboris Nisi Ut
              Aliquip Ex Ea Commodo Consequat Duis Aute Irure Dolor In
              Reprehenderit In Voluptate Velit Esse Cillum Dolore Eu F fugiat
              Nulla Pariatur Excepteur Sint Occaecat Cupidatat Non Proident Sunt
              In Culpa Qui Officia Deserunt Mollit Anim Id Est Laborum{" "}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
export default Notification;

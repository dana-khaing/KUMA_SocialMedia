import Stories from "@/components/home/stories";
import Addpost from "@/components/home/addpost";
import Newfeed from "@/components/home/newfeed";
export default function Home() {
  return (
    <div className="h-[200vh] w-screen flex items-start justify-center gap-5">
      {/* left */}
      <div className="hidden lg:block flex-col w-[22.5%]"></div>
      {/* center */}
      <div className="flex w-full flex-col lg:w-[55%] gap-5 h-[200vh] overscroll-x-none px-0 ">
        <Stories />
        <div className="flex flex-col gap-5 w-[100%] overflow-y-scroll scrollbar-hide overscroll-x-none">
          <Addpost />
          <Newfeed />
        </div>
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col w-[22.5%]"></div>
    </div>
  );
}

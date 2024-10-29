import Stories from "@/components/stories";
import Addpost from "@/components/addpost";
import Newfeed from "@/components/newfeed";
export default function Home() {
  return (
    <div className="p-5 bg-slate-200 h-screen w-screen flex items-center justify-center gap-5">
      {/* left */}
      <div className="hidden xl:block flex-col w-[30%]"></div>
      {/* center */}
      <div className="flex w-full md:w-[40%] gap-5">
        <Stories />
        <Addpost />
        <Newfeed />
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col w-[30%] "></div>
    </div>
  );
}

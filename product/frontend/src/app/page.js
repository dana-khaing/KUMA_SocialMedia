import Stories from "@/components/stories";
import Addpost from "@/components/addpost";
import Newfeed from "@/components/newfeed";
export default function Home() {
  return (
    <div className="p-5  h-screen w-screen flex items-center justify-center gap-5">
      {/* left */}
      <div className="hidden lg:block flex-col w-[22.5%]"></div>
      {/* center */}
      <div className="flex flex-col w-full lg:w-[55%] gap-5 h-screen">
        <Stories />
        <Addpost />
        <Newfeed />
      </div>

      {/* right */}
      <div className="hidden lg:flex flex-col w-[22.5%]"></div>
    </div>
  );
}

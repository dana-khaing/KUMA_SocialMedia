import { SignIn } from "@clerk/nextjs";
import { Separator } from "../../../components/ui/separator";

export default function Page() {
  return (
    <div className="p-4 flex-col gap-1 text-center text-white bg-slate-400 rounded-xl">
      <div>
        <span className="relative text-5xl font-bold pb-3 text-white font-sans italic pointer-events-none">
          Welcome to{" "}
          <span className="relative inline-block">
            <span className="absolute inset-0 bg-[#ff4e02] transform -skew-x-12 rounded-md"></span>
            <span className="relative p-3">KUMA</span>
          </span>{" "}
          !
        </span>

        <h1 className="text-xl pb-5 pt-2 rounded-t-xl italic font-bold pointer-events-none">
          Share. Learn. Grow and Connect.
        </h1>
        <p className=" text-s text-center px-5 italic pointer-events-none">
          KUMA is your dedicated space for academic and professional networking,
          designed to connect you with a thriving community of students and
          professionals. Share your knowledge, seek answers, and build lasting
          connections.
        </p>
      </div>
      <div className="flex rounded-b-xl">
        <div className="hidden md:w-[50%] md:flex flex-col gap-5 justify-center items-center">
          <img
            src="/sign-in4.svg"
            alt="Sign in"
            className="w-[80%] h-[80%] flex justify-center items-center  p-4 rounded-3xl "
          />
        </div>
        <div className=" w-[100%] my-5 h-full md:w-[50%] flex justify-center items-center">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#FF4E02", // Customize the primary color
              },
            }}
          />
        </div>
      </div>
      <Separator className="w-[95%] h-[0.05rem] m-5 mx-auto bg-[#ff4e02]" />
      <h1 className="text-3xl pb-5 pt-2 rounded-t-xl italic font-bold pointer-events-none">
        Where Ideas Come to Life
      </h1>
      <p className=" text-lg text-center px-5 italic pointer-events-none">
        Join this platform built for collaboration, discovery, and inspiration.
        Here, your ideas and experiences meet a community eager to learn, share,
        and grow together.
      </p>
      <div className="flex">
        <div className="flex flex-col gap-5 px-5 w-[50%] h-auto py-5">
          <h1 className=" text-xl text-center italic pointer-events-none text-[#ff4e02]">
            Share your thoughts, experiences, and knowledge with the community.
          </h1>
          <img src="/post.svg" alt="post" className=" w-64 h-54 mx-auto" />
        </div>
        <div className="flex items-center">
          <Separator
            className="w-[0.05rem] m-5 h-[70%] my-auto bg-[#ff4e02]"
            orientation="vertical"
          />
        </div>
        <div className="flex flex-col gap-5 px-5 w-[50%] h-auto py-5">
          <h1 className=" text-xl text-center italic pointer-events-none text-[#ff4e02]">
            Learn from the experiences and knowledge of others.
          </h1>
          <img src="/video.svg" alt="video" className=" w-64 h-54 mx-auto" />
        </div>
      </div>
      <Separator className="w-[95%] h-[0.05rem] m-5 mx-auto bg-[#ff4e02]" />
      <p className=" text-lg text-center px-5 italic pointer-events-none">
        Connect with like-minded individuals and build lasting relationships.
        Here, you can engage in meaningful conversations, share your
        experiences, and learn from others.
      </p>
      <div className="flex">
        <div className="flex flex-col gap-5 px-5 w-[50%] h-auto py-5">
          <h1 className=" text-xl text-center italic pointer-events-none text-[#ff4e02]">
            Engage in meaningful conversations
          </h1>
          <img src="/message.svg" alt="post" className=" w-64 h-54 mx-auto" />
        </div>
        <div className="flex items-center">
          <Separator
            className="w-[0.05rem] m-5 h-[70%] my-auto bg-[#ff4e02]"
            orientation="vertical"
          />
        </div>
        <div className="flex flex-col gap-5 px-5 w-[50%] h-auto py-5">
          <h1 className=" text-xl text-center italic pointer-events-none text-[#ff4e02]">
            Connect with others through video calls.
          </h1>
          <img
            src="/video_call.svg"
            alt="video"
            className=" w-64 h-54 mx-auto"
          />
        </div>
      </div>
      <Separator className="w-[95%] h-[0.05rem] m-5 mx-auto bg-[#ff4e02]" />
      {/* footer */}
      <div className="flex justify-center items-center text-lg text-center text-white ">
        <p className="italic pointer-events-none">
          © 2021 KUMA. All rights reserved.
        </p>
      </div>
    </div>
  );
}

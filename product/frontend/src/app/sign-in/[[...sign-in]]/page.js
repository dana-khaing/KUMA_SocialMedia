import { SignIn } from "@clerk/nextjs";

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

        <h1 className="text-xl pb-5 pt-2 rounded-t-xl italic font-bold ointer-events-none">
          Share. Learn. Grow and Connect.
        </h1>
        <p className=" text-s text-center px-5 italic ointer-events-none">
          KUMA is your dedicated space for academic and professional networking,
          designed to connect you with a thriving community of students and
          professionals. Share your knowledge, seek answers, and build lasting
          connections.
        </p>
      </div>
      <div className="flex rounded-b-xl">
        <div className="hidden md:w-[50%] md:flex flex-col gap-5 justify-center items-center">
          {/* <h1 className="text-xl">"Where Ideas Come to Life"</h1>
        <p className="w-[84%] text-xs text-center">
          Join a platform built for collaboration, discovery, and inspiration.
          Here, your ideas and experiences meet a community eager to learn,
          share, and grow together.
        </p> */}

          <img
            src="/sign-in4.svg"
            alt="Sign in"
            className="w-[60%] h-[60%] flex justify-center items-center  p-4 rounded-3xl "
          />
        </div>
        <div className=" w-[100%] h-[75vh] md:w-[50%] flex justify-center items-center">
          <SignIn
            fallbackRedirectUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: "#FF4E02", // Customize the primary color
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

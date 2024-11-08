import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="p-4 flex gap-4">
      <div className="hidden md:w-[65%] md:flex flex-col gap-5 justify-center items-center">
        <h3 className="text-5xl font-bold text-[#FF4E01]">Welcome to Kuma!</h3>
        <h1 className="text-xl">Share. Learn. Grow Together on KUMA</h1>
        <p class="w-[80%] text-xs text-center">
          KUMA is your dedicated space for academic and professional networking,
          designed to connect you with a thriving community of students and
          professionals. Share your knowledge, seek answers, and build lasting
          connections.
        </p>
        <img
          src="/sign-in4.svg"
          alt="Sign in"
          className="w-[60%] h-[60%] flex justify-center items-center border-2 p-4 rounded-3xl border-[#FF4E01]"
        />
      </div>
      <div className=" w-[100%] h-[75vh] md:w-[45%] flex justify-start items-center">
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
  );
}

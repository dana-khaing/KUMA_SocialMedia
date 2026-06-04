import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <div className="flex bg-[#F0F2F5]" style={{ height: "calc(100vh - 5rem)" }}>
        {/* Left: Brand Panel */}
        <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 overflow-hidden bg-[#0D0603]">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#FF4E02]/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-[#FF4E02]/10 blur-[100px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #FF4E02 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF4E02] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF4E02]/40">
              <span className="text-white font-black text-xl leading-none">K</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">KUMA</span>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col gap-8">
            <div>
              <h1 className="text-6xl font-black text-white leading-[1.05] tracking-tight">
                Ideas meet<br />
                <span className="text-[#FF4E02]">community.</span>
              </h1>
              <p className="mt-5 text-white/50 text-lg leading-relaxed max-w-sm">
                Join thousands of students and professionals who share knowledge,
                ask questions, and build lasting connections on KUMA.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: "Post & Discuss", desc: "Share thoughts and start conversations" },
                { label: "Video Content", desc: "Learn from video posts and tutorials" },
                { label: "Stay Updated", desc: "Get notified about what matters to you" },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#FF4E02] mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-white/40 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <img src="/discuss.svg" alt="" aria-hidden="true" className="w-1/2 opacity-70" />
              <img src="/connected.svg" alt="" aria-hidden="true" className="w-1/2 opacity-70" />
            </div>
          </div>

          <p className="relative z-10 text-white/20 text-sm">© 2025 KUMA. All rights reserved.</p>
        </div>

        {/* Right: Auth Panel */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-8 py-10 bg-[#F0F2F5]">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-[#FF4E02] rounded-xl flex items-center justify-center shadow-md shadow-[#FF4E02]/30">
              <span className="text-white font-black text-lg leading-none">K</span>
            </div>
            <span className="text-gray-900 font-black text-xl tracking-tight">KUMA</span>
          </div>

          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Join KUMA</h2>
              <p className="text-gray-400 mt-2 text-base">Create your account and start connecting today</p>
            </div>

            <SignUp
              appearance={{
                variables: {
                  colorPrimary: "#FF4E02",
                  colorBackground: "#FFFFFF",
                  colorText: "#111827",
                  colorTextSecondary: "#6B7280",
                  colorInputBackground: "#FFFFFF",
                  colorInputText: "#111827",
                  colorNeutral: "#E5E7EB",
                  borderRadius: "0.75rem",
                  spacingUnit: "1rem",
                },
                elements: {
                  rootBox: { style: { width: "100%" } },
                  card: { style: { boxShadow: "none", border: "none", background: "transparent", padding: 0 } },
                  headerTitle: { style: { display: "none" } },
                  headerSubtitle: { style: { display: "none" } },
                  socialButtonsBlockButton: "border-2 border-gray-200 hover:border-[#FF4E02] hover:bg-orange-50 transition-all duration-150 font-semibold text-gray-700 bg-white",
                  formButtonPrimary: "bg-[#FF4E02] hover:bg-[#e04500] text-white font-bold transition-colors duration-150",
                  footerActionLink: "text-[#FF4E02] font-semibold hover:text-[#e04500]",
                  formFieldInput: { style: { border: "1.5px solid #D1D5DB", borderRadius: "0.75rem", backgroundColor: "#FFFFFF", color: "#111827" } },
                  formFieldLabel: "text-gray-700 font-medium text-sm",
                  dividerLine: "bg-gray-300",
                  dividerText: "text-gray-400 text-sm",
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

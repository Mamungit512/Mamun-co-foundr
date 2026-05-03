import { FaShieldAlt } from "react-icons/fa";

export default function PendingActivationPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
        <FaShieldAlt className="h-8 w-8 text-yellow-400" />
      </div>
      <div className="max-w-sm space-y-2">
        <h1 className="text-2xl font-bold text-(--mist-white)">
          Account Pending Activation
        </h1>
        <p className="text-sm leading-relaxed text-white/50">
          Your school account is being set up. This typically takes 1-2
          business days. You will receive an email once your program is
          activated.
        </p>
      </div>
      <p className="text-xs text-white/25">
        If you believe this is an error, please contact your program
        coordinator.
      </p>
    </div>
  );
}

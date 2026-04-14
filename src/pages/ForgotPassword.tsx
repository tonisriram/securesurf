import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast({ title: "Demo Mode", description: "Password reset requires Lovable Cloud." });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Demo Mode", description: "OTP verification requires Lovable Cloud." });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-1">{sent ? "Enter Verification Code" : "Reset Password"}</h1>
          <p className="text-sm text-muted-foreground">
            {sent ? `We sent a 6-digit code to ${email}` : "Enter your email to receive a reset code"}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition disabled:opacity-50">
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">6-Digit Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"
                  className="w-full h-14 px-4 rounded-xl bg-secondary border border-border text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50" maxLength={6} />
              </div>
              <button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition">
                Verify Code
              </button>
              <button type="button" onClick={() => setSent(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition">
                Didn't receive a code? Resend
              </button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@/hooks/useAuth";

const signupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export function Signup() {
  const navigate = useNavigate();
  const signUp = useSignUp();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = (data: any) => {
    signUp.mutate(data, {
      onSuccess: () => navigate("/dashboard"),
      onError: (err: any) => alert(err.message),
    });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left Form Section */}
      <div className="flex flex-col justify-center p-8 md:p-24 relative z-10">
        <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-24 text-2xl font-bold tracking-tighter text-primary">
          SplitX
        </Link>
        
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Create an account</h1>
          <p className="text-muted-foreground mb-10">Start splitting expenses perfectly.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input type="text" placeholder="John" {...register("firstName")} className="pl-10 h-12 bg-secondary/30 rounded-xl border-border focus-visible:ring-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground opacity-0" />
                  <Input type="text" placeholder="Doe" {...register("lastName")} className="px-4 h-12 bg-secondary/30 rounded-xl border-border focus-visible:ring-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input type="email" placeholder="name@example.com" {...register("email")} className="pl-10 h-12 bg-secondary/30 rounded-xl border-border focus-visible:ring-primary" />
              </div>
              {errors.email && <p className="text-xs text-destructive">{(errors.email as any).message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" {...register("password")} className="pl-10 h-12 bg-secondary/30 rounded-xl border-border focus-visible:ring-primary" />
              </div>
              {errors.password && <p className="text-xs text-destructive">{(errors.password as any).message}</p>}
            </div>
            
            <Button disabled={signUp.isPending} type="submit" className="w-full h-12 rounded-xl text-md shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform">
              {signUp.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button type="button" variant="outline" className="w-full h-12 rounded-xl">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground font-medium hover:underline">
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
      
      {/* Right Illustration Section */}
      <div className="hidden md:flex relative bg-secondary overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-primary/10 to-transparent"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        {/* Mock Graphic */}
        <div className="relative z-10 p-12 w-full max-w-lg">
           <div className="bg-card/50 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
             <div className="flex gap-4 items-center mb-8">
               <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xl shadow-lg">
                 SP
               </div>
               <div>
                 <p className="font-semibold text-xl">SplitX Premium</p>
                 <p className="text-muted-foreground text-sm">Join the club</p>
               </div>
             </div>
             <div className="space-y-6">
                {[
                  { title: "No hidden fees", desc: "Completely transparent." },
                  { title: "AI Expense parsing", desc: "Just talk to it." },
                  { title: "Instant settlements", desc: "Money moves fast." }
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                        <ArrowRight className="h-4 w-4 text-primary" />
                     </div>
                     <div>
                        <p className="font-medium">{f.title}</p>
                        <p className="text-sm text-muted-foreground">{f.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

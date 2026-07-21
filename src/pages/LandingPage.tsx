import { motion } from "framer-motion";
import { ArrowRight, PieChart, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardMockup } from "@/components/landing/DashboardMockup";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 container mx-auto relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 dark:opacity-20 pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at top, hsl(var(--primary)) 0%, transparent 70%)' }} />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border"
          >
             <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
             Introducing the future of finance
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.1]"
          >
            Seamlessly Manage <br className="hidden md:block" /> Shared Finances.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light"
          >
            SplitX is the premium way to track shared expenses, settle debts seamlessly, and maintain absolute financial harmony.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-8 text-lg h-14 w-full shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                Start Splitting <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14 w-full hover:bg-secondary/50">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.5 }}
        >
          <DashboardMockup />
        </motion.div>
      </section>

      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-amber-500" />}
              title="Unmatched Speed & Precision"
              description="Add expenses in seconds with AI-powered natural language processing and receipt scanning."
            />
            <FeatureCard 
              icon={<PieChart className="h-8 w-8 text-indigo-500" />}
              title="Intelligent Spending Insights"
              description="Understand your spending habits with beautiful, interactive charts and insights."
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-emerald-500" />}
              title="Enterprise-Grade Security"
              description="Settle up securely using your preferred payment method with bank-grade encryption."
            />
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="absolute -top-40 -right-40 h-96 w-96 bg-primary/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
          <h2 className="text-5xl font-bold tracking-tight mb-6">Ready to elevate your financial life?</h2>
          <p className="text-xl text-muted-foreground mb-10">Start managing your shared expenses today with the most premium platform.</p>
          <Link to="/signup">
            <Button size="lg" className="rounded-full px-10 text-lg h-16 shadow-xl shadow-primary/25 hover:scale-105 transition-all">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold tracking-tighter text-primary">SplitX</span>
            <p className="text-sm text-muted-foreground mt-2">© 2026 SplitX Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6 p-4 rounded-2xl bg-secondary/50 inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

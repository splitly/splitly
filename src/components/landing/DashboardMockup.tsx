import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-[2.5rem] p-4 bg-white/5 dark:bg-black/20 backdrop-blur-3xl border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden mt-20">
      
      {/* Glossy top highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <div className="rounded-[2rem] bg-background border border-border overflow-hidden shadow-inner flex flex-col md:flex-row relative z-10">
        
        {/* Sidebar Mockup */}
        <div className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col gap-6 hidden md:flex">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="h-4 w-24 bg-muted rounded-full"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-3 w-16 bg-muted-foreground/30 rounded-full mb-2"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted"></div>
                <div className="h-3 w-24 bg-muted/60 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Mockup */}
        <div className="flex-1 p-6 md:p-10 bg-secondary/20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-muted-foreground font-medium mb-2">Total Balance</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">₹4,250.00</h2>
            </div>
            <div className="h-10 w-32 bg-primary rounded-full hidden sm:block shadow-lg shadow-primary/20"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-success/20 flex items-center justify-center">
                <ArrowDownRight className="text-success h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">You are owed</p>
                <p className="text-2xl font-semibold">₹1,420.50</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
                <ArrowUpRight className="text-destructive h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">You owe</p>
                <p className="text-2xl font-semibold">₹345.20</p>
              </div>
            </motion.div>
          </div>

          <div>
            <p className="text-muted-foreground font-medium mb-4">Recent Activity</p>
            <div className="space-y-4">
              {[
                { name: "Dinner at Nobu", amount: "₹320.00", date: "Today, 8:45 PM", icon: "🍔" },
                { name: "Airbnb - Weekend Trip", amount: "₹840.50", date: "Yesterday", icon: "🏠" },
                { name: "Uber to Airport", amount: "₹45.20", date: "Mon, 12 Oct", icon: "🚗" },
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  viewport={{ once: true }}
                  key={i} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-xl">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{item.amount}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Ambient glows behind the mockup */}
      <div className="absolute -top-40 -right-40 h-96 w-96 bg-primary/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 h-96 w-96 bg-accent/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Camera, Barcode, Image, Pencil, Zap } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      {/*
        NOTE: The app uses a fixed-viewport layout globally (html/body/root overflow hidden).
        So this page must be its own scroll container.
      */}
      <div className="h-full bg-background flex flex-col overflow-y-auto overscroll-none">
        <main className="min-h-full flex flex-col items-center justify-start px-6 py-12 pb-safe pt-safe">
          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-[280px] aspect-[9/16] rounded-[40px] bg-foreground p-2 shadow-2xl"
          >
            {/* Phone inner screen */}
            <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-background">
              {/* Food image background */}
              <img 
                src={heroImage} 
                alt="Food scanning" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Overlay for better contrast */}
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Scanner frame corners */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Top left corner */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white/80 rounded-tl-lg" />
                  {/* Top right corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white/80 rounded-tr-lg" />
                  {/* Bottom left corner */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white/80 rounded-bl-lg" />
                  {/* Bottom right corner */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white/80 rounded-br-lg" />
                </div>
              </div>
              
              {/* Top bar with close and help icons */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-sm">×</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-sm">?</span>
                </div>
              </div>
              
              {/* Bottom controls */}
              <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4">
                {/* Mode selector */}
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1">
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white font-medium">Scan Food</span>
                  </div>
                  <div className="p-1.5">
                    <Barcode className="w-4 h-4 text-white/70" />
                  </div>
                  <div className="p-1.5">
                    <Image className="w-4 h-4 text-white/70" />
                  </div>
                  <div className="p-1.5">
                    <Pencil className="w-4 h-4 text-white/70" />
                  </div>
                </div>
                
                {/* Capture controls */}
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-white/50" />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mt-10"
          >
            <h1 className="text-3xl font-bold tracking-tight">
              Calorie tracking
              <br />
              made easy
            </h1>
          </motion.div>
          
          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            onClick={() => navigate("/auth?mode=signup")}
            className="mt-8 w-full max-w-sm bg-foreground text-background font-semibold py-4 px-8 rounded-2xl text-lg transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Get Started
          </motion.button>

          {/* Feature highlights */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.45 }}
            className="w-full max-w-sm mt-6"
            aria-label="Key features"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Camera className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-semibold leading-tight">Photo AI analysis</p>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">Snap a meal, get calories + macros.</p>
              </div>

              <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Barcode className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-semibold leading-tight">Barcode scanning</p>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">Log packaged foods instantly.</p>
              </div>

              <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Pencil className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-semibold leading-tight">Manual logging</p>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">Quick add when you’re offline.</p>
              </div>

              <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-semibold leading-tight">Smarter goals</p>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">Personal targets + progress insights.</p>
              </div>
            </div>
          </motion.section>

          {/* Testimonials */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.45 }}
            className="w-full max-w-sm mt-8"
            aria-label="User testimonials"
          >
            <div className="flex flex-col gap-3">
              <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                <p className="text-sm text-muted-foreground italic leading-relaxed">"Finally, an app that makes tracking effortless. I just snap a photo and I'm done!"</p>
                <p className="text-xs font-medium mt-2">— Sarah M.</p>
              </div>

              <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                <p className="text-sm text-muted-foreground italic leading-relaxed">"Lost 12 lbs in 2 months. The AI is scary accurate at estimating portions."</p>
                <p className="text-xs font-medium mt-2">— James K.</p>
              </div>

              <div className="bg-card border border-border/30 rounded-2xl p-4 shadow-sm">
                <p className="text-sm text-muted-foreground italic leading-relaxed">"Way better than manually logging everything. This actually fits my lifestyle."</p>
                <p className="text-xs font-medium mt-2">— Emily R.</p>
              </div>
            </div>
          </motion.section>
          
          {/* Sign in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/auth?mode=login")}
              className="font-semibold text-foreground hover:underline"
            >
              Sign In
            </button>
          </motion.p>
        </main>
      </div>
    </PageTransition>
  );
}

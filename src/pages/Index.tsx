import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, ChefHat } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionResults } from "@/components/NutritionResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroFood from "@/assets/hero-food.jpg";

interface NutritionData {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get nutrition info in seconds",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Advanced image recognition",
  },
  {
    icon: Shield,
    title: "Accurate Data",
    description: "Reliable macro estimates",
  },
];

export default function Index() {
  const [results, setResults] = useState<NutritionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = async (base64: string) => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: { imageBase64: base64 },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
      toast({
        title: "Analysis complete!",
        description: `Found ${data.foods.length} food item(s)`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container py-4">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NutriMind</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="ghost" size="sm">
              About
            </Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container pb-16">
        <section className="py-8 md:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Nutrition</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Know What You Eat,{" "}
                <span className="text-gradient-primary">Instantly</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md">
                Snap a photo of your meal and get instant macronutrient analysis. 
                Track protein, carbs, and fat with cutting-edge AI technology.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-4 pt-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span>{feature.title}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA for larger screens */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:block pt-4"
              >
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze Your Meal
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-card">
                <img
                  src={heroFood}
                  alt="Healthy meal bowl"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-protein/10 flex items-center justify-center">
                    <span className="text-protein font-bold text-lg">32g</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Protein</p>
                    <p className="text-xs text-muted-foreground">Per serving</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Upload Section */}
        <section id="upload-section" className="py-12 scroll-mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Upload Your Meal
            </h2>
            <p className="text-muted-foreground">
              Take a photo or upload an image to get started
            </p>
          </motion.div>

          <ImageUpload onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />
        </section>

        {/* Results Section */}
        {results && (
          <section className="py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-foreground">Your Results</h2>
            </motion.div>
            <NutritionResults data={results} />
          </section>
        )}

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:hidden text-center pt-8"
        >
          <Button
            variant="hero"
            size="lg"
            onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Sparkles className="w-5 h-5" />
            Try It Now
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 NutriMind. AI-powered nutrition analysis.</p>
          <p>Results are estimates. Consult a nutritionist for dietary advice.</p>
        </div>
      </footer>
    </div>
  );
}

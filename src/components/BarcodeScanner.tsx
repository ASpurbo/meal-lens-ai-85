import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductFound: (data: {
    foods: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: "low" | "medium" | "high";
    notes: string;
  }) => void;
}

interface ProductData {
  product_name?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal_serving"?: number;
    proteins_100g?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat_serving?: number;
  };
  serving_size?: string;
}

export function BarcodeScanner({ open, onOpenChange, onProductFound }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (open && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startScanner();
    } else if (!open) {
      hasStartedRef.current = false;
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    setError(null);
    setIsCameraLoading(true);
    
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      if (!scannerRef.current) {
        setIsCameraLoading(false);
        return;
      }

      const scannerId = "barcode-scanner-element";
      
      // Clear existing scanner element
      const existingElement = document.getElementById(scannerId);
      if (existingElement) {
        existingElement.remove();
      }
      
      // Create fresh scanner element
      const scannerElement = document.createElement("div");
      scannerElement.id = scannerId;
      scannerRef.current.appendChild(scannerElement);

      html5QrCodeRef.current = new Html5Qrcode(scannerId, { verbose: false });

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.333,
          disableFlip: false,
        },
        async (decodedText: string) => {
          await handleBarcodeScan(decodedText);
        },
        () => {
          // Barcode not found - ignore silently
        }
      );
      
      setIsScanning(true);
      setIsCameraLoading(false);
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Could not access camera. Please ensure camera permissions are granted.");
      setIsScanning(false);
      setIsCameraLoading(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState?.();
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        // Ignore errors when stopping
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
    setIsCameraLoading(false);
  };

  const handleBarcodeScan = async (barcode: string) => {
    await stopScanner();
    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.status !== 1 || !data.product) {
        setError("Product not found. Try scanning again or add manually.");
        setIsLoading(false);
        setTimeout(() => startScanner(), 2000);
        return;
      }

      const product: ProductData = data.product;
      const nutriments = product.nutriments || {};

      // Prefer serving size values if available, otherwise use per 100g
      const calories = Math.round(
        nutriments["energy-kcal_serving"] || nutriments["energy-kcal_100g"] || 0
      );
      const protein = Math.round(
        (nutriments.proteins_serving || nutriments.proteins_100g || 0) * 10
      ) / 10;
      const carbs = Math.round(
        (nutriments.carbohydrates_serving || nutriments.carbohydrates_100g || 0) * 10
      ) / 10;
      const fat = Math.round(
        (nutriments.fat_serving || nutriments.fat_100g || 0) * 10
      ) / 10;

      const foodName = product.product_name || "Unknown Product";
      const brand = product.brands ? ` (${product.brands})` : "";
      const servingNote = product.serving_size 
        ? `Per serving: ${product.serving_size}` 
        : "Values per 100g";

      onProductFound({
        foods: [`${foodName}${brand}`],
        calories,
        protein,
        carbs,
        fat,
        confidence: "high",
        notes: servingNote,
      });

      onOpenChange(false);
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch product info. Please try again.");
      setTimeout(() => startScanner(), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Scan Barcode</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            ref={scannerRef}
            className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                  <span className="text-sm text-muted-foreground">Looking up product...</span>
                </div>
              </div>
            )}
            
            {isCameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Initializing camera...</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Point your camera at a product barcode
          </p>

          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

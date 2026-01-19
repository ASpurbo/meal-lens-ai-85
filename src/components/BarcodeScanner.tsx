import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, Camera, PenLine, Barcode, Check, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface NutritionData {
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "low" | "medium" | "high";
  notes: string;
}

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductFound: (data: NutritionData) => void;
  onSwitchToCamera?: () => void;
  onSwitchToManual?: () => void;
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

type ViewState = "scanning" | "results";

export function BarcodeScanner({ open, onOpenChange, onProductFound, onSwitchToCamera, onSwitchToManual }: BarcodeScannerProps) {
  const [viewState, setViewState] = useState<ViewState>("scanning");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<NutritionData | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const { t } = useTranslation();

  useEffect(() => {
    isMountedRef.current = true;
    
    if (open) {
      setViewState("scanning");
      setScannedProduct(null);
      setError(null);
      startScanner();
    }

    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    if (isStartingRef.current || html5QrCodeRef.current) return;
    isStartingRef.current = true;
    
    setError(null);
    setIsCameraLoading(true);
    
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      if (!isMountedRef.current || !scannerRef.current) {
        isStartingRef.current = false;
        setIsCameraLoading(false);
        return;
      }

      const scannerId = "barcode-scanner-element";
      
      const existingElement = document.getElementById(scannerId);
      if (existingElement) {
        existingElement.remove();
      }
      
      const scannerElement = document.createElement("div");
      scannerElement.id = scannerId;
      scannerElement.style.width = "100%";
      scannerElement.style.height = "100%";
      scannerRef.current.appendChild(scannerElement);

      html5QrCodeRef.current = new Html5Qrcode(scannerId, { verbose: false });

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
        },
        async (decodedText: string) => {
          if (isMountedRef.current) {
            await handleBarcodeScan(decodedText);
          }
        },
        () => {}
      );
      
      if (isMountedRef.current) {
        setIsScanning(true);
        setIsCameraLoading(false);
      }
    } catch (err) {
      console.error("Scanner error:", err);
      if (isMountedRef.current) {
        setError("Could not access camera. Please ensure camera permissions are granted.");
        setIsScanning(false);
        setIsCameraLoading(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {}
      try {
        html5QrCodeRef.current.clear();
      } catch (err) {}
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
    setIsCameraLoading(false);
    isStartingRef.current = false;
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (isLoading) return;
    
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

      const nutritionData: NutritionData = {
        foods: [`${foodName}${brand}`],
        calories,
        protein,
        carbs,
        fat,
        confidence: "high",
        notes: servingNote,
      };

      setScannedProduct(nutritionData);
      setViewState("results");
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch product info. Please try again.");
      setTimeout(() => startScanner(), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onOpenChange(false);
  };

  const handleRetake = async () => {
    setScannedProduct(null);
    setViewState("scanning");
    await startScanner();
  };

  const handleConfirm = async () => {
    if (scannedProduct) {
      // Stop scanner first
      await stopScanner();
      // Call onProductFound which will trigger confirmation flow
      onProductFound(scannedProduct);
      // Close the barcode scanner
      onOpenChange(false);
    }
  };

  const handleSwitchCamera = async () => {
    await stopScanner();
    onOpenChange(false);
    onSwitchToCamera?.();
  };

  const handleSwitchManual = async () => {
    await stopScanner();
    onOpenChange(false);
    onSwitchToManual?.();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-b from-[hsl(350,30%,12%)] to-[hsl(350,40%,8%)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 pt-safe">
          <div className="w-10" />
          
          <div className="flex items-center gap-2">
            <span className="text-white text-lg font-semibold">{t.scan.scanBarcode}</span>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* SCANNING VIEW */}
        {viewState === "scanning" && (
          <>
            {/* Instruction text */}
            <div className="px-4 py-2 text-center text-white/70 text-sm">
              Point your camera at a product barcode
            </div>

            {/* Camera viewfinder area */}
            <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
              {/* Scanner container */}
              <div 
                ref={scannerRef}
                className="absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-[hsl(350,30%,12%)]/60 via-transparent to-[hsl(350,40%,8%)]/80 pointer-events-none" />
              
              {/* Scanning frame */}
              <div className="relative w-full max-w-sm z-10">
                <div className="relative w-full aspect-[2.5/1]">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white/80 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white/80 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white/80 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white/80 rounded-br-lg" />
                  
                  {/* Scanning laser line */}
                  {isScanning && !isLoading && (
                    <motion.div 
                      className="absolute left-4 right-4 h-0.5 bg-primary"
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>
              </div>

              {/* Loading overlays */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                    <span className="text-sm text-white/70">Looking up product...</span>
                  </div>
                </div>
              )}
              
              {isCameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                    <span className="text-sm text-white/70">Starting camera...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-4 flex items-center gap-2 p-3 bg-destructive/20 rounded-lg text-white text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Mode Switcher */}
            <div className="px-6 py-3">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleSwitchCamera}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {t.scan.takePhoto}
                </button>
                <button
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white text-black flex items-center gap-2"
                >
                  <Barcode className="w-4 h-4" />
                  {t.scan.scanBarcode}
                </button>
                <button
                  onClick={handleSwitchManual}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <PenLine className="w-4 h-4" />
                  {t.scan.manualEntry}
                </button>
              </div>
            </div>

            {/* Bottom area */}
            <div className="px-6 pb-8 pb-safe">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full bg-white/10 text-white text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* RESULTS VIEW */}
        {viewState === "results" && scannedProduct && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1 flex flex-col justify-end px-4 pb-safe"
          >
            {/* Results card */}
            <div className="bg-background/95 backdrop-blur-xl rounded-t-3xl p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">Product Found</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {scannedProduct.foods[0]}
                </p>
              </div>

              {/* Nutrition overview */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-calories/10 rounded-xl">
                  <div className="text-base font-bold text-calories">{scannedProduct.calories}</div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
                <div className="text-center p-2 bg-protein/10 rounded-xl">
                  <div className="text-base font-bold text-protein">{scannedProduct.protein}g</div>
                  <div className="text-xs text-muted-foreground">protein</div>
                </div>
                <div className="text-center p-2 bg-carbs/10 rounded-xl">
                  <div className="text-base font-bold text-carbs">{scannedProduct.carbs}g</div>
                  <div className="text-xs text-muted-foreground">carbs</div>
                </div>
                <div className="text-center p-2 bg-fat/10 rounded-xl">
                  <div className="text-base font-bold text-fat">{scannedProduct.fat}g</div>
                  <div className="text-xs text-muted-foreground">fat</div>
                </div>
              </div>

              {/* Note */}
              {scannedProduct.notes && (
                <p className="text-center text-sm text-muted-foreground">{scannedProduct.notes}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleRetake}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full border border-border text-foreground font-medium text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Scan Again
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm"
                >
                  <Check className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
import { supabase } from "@/integrations/backendClient";
import { useAuth } from "./useAuth";

export function useMealImageUpload() {
  const { user } = useAuth();

  const uploadMealImage = async (base64Image: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Convert base64 to blob
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // Generate unique filename
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("meal-images")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading image:", error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("meal-images")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error processing image upload:", error);
      return null;
    }
  };

  return { uploadMealImage };
}

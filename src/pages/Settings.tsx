import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Moon, Sun, Lock, Trash2, LogOut, Camera, 
  ChevronRight, AlertTriangle, Loader2, Apple, ArrowLeft,
  Ruler, Scale, X, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { differenceInYears, parseISO } from "date-fns";
import { SUPPORTED_LANGUAGES, getLanguageLabel, getLanguageFlag } from "@/lib/languages";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [editField, setEditField] = useState<"height" | "weight" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    try {
      return differenceInYears(new Date(), parseISO(birthday));
    } catch {
      return null;
    }
  };

  const userAge = profile?.birthday ? calculateAge(profile.birthday) : profile?.age;

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({ title: "Profile picture updated" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;

    setIsRemovingAvatar(true);
    try {
      await supabase.storage.from("avatars").remove([
        `${user.id}/avatar.jpg`,
        `${user.id}/avatar.png`,
        `${user.id}/avatar.jpeg`,
        `${user.id}/avatar.webp`
      ]);

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({ title: "Profile picture removed" });
    } catch (error: any) {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const openEditDialog = (field: "height" | "weight") => {
    setEditField(field);
    setEditValue(
      field === "height" 
        ? profile?.height_cm?.toString() || "" 
        : profile?.weight_kg?.toString() || ""
    );
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!user?.id || !editField) return;

    setIsSavingEdit(true);
    try {
      const updateData = editField === "height" 
        ? { height_cm: Number(editValue) }
        : { weight_kg: Number(editValue) };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({ title: "Updated successfully" });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    if (!user?.id) return;

    setIsSavingLanguage(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ language: languageCode })
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast({ title: "Language updated" });
      setIsLanguageDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingLanguage(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Password updated" });
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeletingAccount(true);
    try {
      // Call the edge function to completely delete the account
      const { data, error } = await supabase.functions.invoke("delete-account");

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({ title: "Account deleted successfully" });
      await signOut();
      navigate("/auth");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast({ 
        title: "Failed to delete account", 
        description: error.message || "Please try again later", 
        variant: "destructive" 
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container py-8 pb-24 space-y-8 max-w-lg mx-auto">
        {/* Profile */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-accent text-foreground font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background hover:bg-foreground/90 transition-colors"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile?.display_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {profile?.avatar_url && (
            <button 
              onClick={handleRemoveAvatar}
              disabled={isRemovingAvatar}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {isRemovingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              Remove photo
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-accent rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold">{userAge || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Age</p>
          </div>
          <button 
            onClick={() => openEditDialog("height")}
            className="bg-accent rounded-2xl p-4 text-center hover:bg-accent/80 transition-colors"
          >
            <p className="text-2xl font-semibold">{profile?.height_cm || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Height cm</p>
          </button>
          <button 
            onClick={() => openEditDialog("weight")}
            className="bg-accent rounded-2xl p-4 text-center hover:bg-accent/80 transition-colors"
          >
            <p className="text-2xl font-semibold">{profile?.weight_kg || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weight kg</p>
          </button>
        </div>

        {/* Preferences */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 mb-3">Preferences</p>
          
          {/* Language */}
          <button 
            onClick={() => setIsLanguageDialogOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent hover:bg-accent/80 transition-colors mb-2"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5" />
              <span className="font-medium">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {getLanguageFlag(profile?.language || "en")} {getLanguageLabel(profile?.language || "en")}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
          
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-accent">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </div>

        {/* Security */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 mb-3">Security</p>
          <button 
            onClick={() => setIsPasswordDialogOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent hover:bg-accent/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Change Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Account */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 mb-3">Account</p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent hover:bg-accent/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Delete Account</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                >
                  {isDeletingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Apple className="w-5 h-5 text-foreground" />
            <span className="font-medium text-foreground">NutriMind</span>
          </div>
          <p className="text-xs">Version 1.0.0</p>
        </div>
      </main>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your new password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="rounded-xl">
              {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editField === "height" ? <Ruler className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
              Edit {editField === "height" ? "Height" : "Weight"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editField === "height" ? "170" : "70"}
              min={editField === "height" ? 100 : 30}
              max={editField === "height" ? 250 : 300}
              step={editField === "height" ? 1 : 0.1}
              className="h-12 rounded-xl text-lg text-center"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="rounded-xl">
              {isSavingEdit && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Select Language
            </DialogTitle>
            <DialogDescription>Choose your preferred language</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-[50vh] overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isSavingLanguage}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  profile?.language === lang.code
                    ? "bg-foreground text-background"
                    : "hover:bg-accent"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
                {isSavingLanguage && profile?.language !== lang.code && (
                  <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
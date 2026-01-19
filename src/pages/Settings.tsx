import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Moon, Sun, Lock, Trash2, LogOut, Camera, 
  ChevronRight, AlertTriangle, Loader2, ArrowLeft,
  X, Globe, HelpCircle, FileText
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/backendClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInYears, parseISO } from "date-fns";
import { SUPPORTED_LANGUAGES, getLanguageLabel, getLanguageFlag } from "@/lib/languages";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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

      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["profile-language", user.id] });
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
      const { data, error } = await supabase.functions.invoke("delete-account");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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

  // Cal AI style setting item component
  const SettingItem = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    showArrow = true,
    rightElement 
  }: { 
    icon: any; 
    label: string; 
    value?: string; 
    onClick?: () => void; 
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center justify-between py-4 border-b border-border/50 last:border-0 disabled:cursor-default"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-muted-foreground text-sm">{value}</span>}
        {rightElement}
        {showArrow && onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-background"
    >
      {/* Cal AI style header */}
      <header className="flex-shrink-0 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{t.settings.title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Profile Card - Cal AI Style */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-lg bg-muted font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-foreground flex items-center justify-center text-background"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3" />
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
              <div className="flex-1">
                <h2 className="font-semibold">{profile?.display_name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile?.avatar_url && (
                  <button 
                    onClick={handleRemoveAvatar}
                    disabled={isRemovingAvatar}
                    className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1"
                  >
                    {isRemovingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center py-3 bg-muted/50 rounded-xl">
                <p className="text-xl font-bold">{userAge || "—"}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.settings.age}</p>
              </div>
              <button 
                onClick={() => openEditDialog("height")}
                className="text-center py-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              >
                <p className="text-xl font-bold">{profile?.height_cm || "—"}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.settings.heightCm}</p>
              </button>
              <button 
                onClick={() => openEditDialog("weight")}
                className="text-center py-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
              >
                <p className="text-xl font-bold">{profile?.weight_kg || "—"}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.settings.weightKg}</p>
              </button>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border px-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider pt-4 pb-2">{t.settings.preferences}</p>
            
            <SettingItem 
              icon={Globe}
              label={t.settings.language}
              value={`${getLanguageFlag(profile?.language || "en")} ${getLanguageLabel(profile?.language || "en")}`}
              onClick={() => setIsLanguageDialogOpen(true)}
            />
            
            <SettingItem 
              icon={isDarkMode ? Moon : Sun}
              label={t.settings.darkMode}
              showArrow={false}
              rightElement={
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              }
            />
          </motion.div>

          {/* Security Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border px-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider pt-4 pb-2">{t.settings.security}</p>
            
            <SettingItem 
              icon={Lock}
              label={t.settings.changePassword}
              onClick={() => setIsPasswordDialogOpen(true)}
            />
          </motion.div>

          {/* Help Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl border border-border px-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider pt-4 pb-2">{t.settings.help}</p>
            
            <SettingItem 
              icon={HelpCircle}
              label={t.settings.replayTour}
              onClick={async () => {
                if (!user?.id) return;
                await supabase
                  .from("profiles")
                  .update({ has_seen_tour: false })
                  .eq("user_id", user.id);
                navigate("/scan");
              }}
            />
          </motion.div>

          {/* Legal Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border px-4"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider pt-4 pb-2">Legal</p>
            
            <Link to="/datenschutz" className="block">
              <SettingItem 
                icon={FileText}
                label="Privacy Policy"
              />
            </Link>
            
            <Link to="/impressum" className="block">
              <SettingItem 
                icon={FileText}
                label="Imprint"
              />
            </Link>
          </motion.div>

          {/* Account Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            <button 
              onClick={handleSignOut}
              className="w-full py-4 rounded-2xl bg-card border border-border flex items-center justify-center gap-2 text-foreground font-medium"
            >
              <LogOut className="w-4 h-4" />
              {t.settings.signOut}
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="w-full py-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center gap-2 text-destructive font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.settings.deleteAccount}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <AlertDialogTitle className="text-center">Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-center">
                    This action cannot be undone. All your data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
                  >
                    {isDeletingAccount ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Delete Forever
                  </AlertDialogAction>
                  <AlertDialogCancel className="w-full rounded-full">Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editField === "height" ? t.settings.heightCm : t.settings.weightKg}
            </DialogTitle>
            <DialogDescription>
              Enter your {editField === "height" ? "height in cm" : "weight in kg"}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={editField === "height" ? "175" : "70"}
            className="text-center text-2xl font-bold h-14 rounded-xl"
          />
          <DialogFooter>
            <button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="w-full py-3 rounded-full bg-foreground text-background font-medium flex items-center justify-center"
            >
              {isSavingEdit && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.settings.changePassword}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="rounded-xl"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <button
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
              className="w-full py-3 rounded-full bg-foreground text-background font-medium flex items-center justify-center"
            >
              {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Update Password
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.settings.language}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isSavingLanguage}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  profile?.language === lang.code 
                    ? "bg-foreground text-background" 
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
                {isSavingLanguage && profile?.language !== lang.code && (
                  <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

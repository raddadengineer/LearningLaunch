import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";
import { speak } from "@/lib/speech";
import { hydratePreferencesForUser } from "@/lib/voice-preferences";
import { KidHelpButton } from "@/components/kid-ui";
import { HELP_USER_SELECTION } from "@/lib/page-help";
import { motion } from "framer-motion";

const KID_EMOJIS = ["🐻", "🐰", "🦊", "🐱", "🐶", "🦁", "🐼", "🐸"];
const AVATAR_GRADIENTS = [
  "from-orange-400 to-red-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-yellow-400 to-amber-500",
  "from-teal-400 to-emerald-500",
  "from-indigo-400 to-violet-500",
];

function kidEmoji(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
  return KID_EMOJIS[code % KID_EMOJIS.length];
}

function avatarGradient(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

export default function UserSelection() {
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", age: 5 });
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()),
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: { name: string; age: number }) =>
      apiRequest("/api/users", "POST", userData),
    onSuccess: async (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      localStorage.setItem("currentUserId", newUser.id.toString());
      try {
        await hydratePreferencesForUser(newUser.id);
      } catch (error) {
        console.warn("Could not load voice preferences:", error);
      }
      toast({ title: `Welcome ${newUser.name}!` });
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const selectUser = async (userId: number) => {
    localStorage.setItem("currentUserId", userId.toString());
    try {
      await hydratePreferencesForUser(userId);
    } catch (error) {
      console.warn("Could not load voice preferences:", error);
    }
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    toast({ title: `Welcome back!` });
    window.location.href = "/";
  };

  const handleCreateUser = () => {
    if (!newUser.name.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleCreateNewGuest = () => {
    const guestNames = ["Guest Explorer", "Guest Learner", "Guest Student", "Guest Friend", "Guest Buddy"];
    const randomName = guestNames[Math.floor(Math.random() * guestNames.length)];
    const uniqueNumber = Math.floor(Math.random() * 999) + 1;
    const guestName = `${randomName} ${uniqueNumber}`;
    createUserMutation.mutate({ name: guestName, age: 5 });
    setShowGuestOptions(false);
  };

  const handleSelectGuest = (user: User) => {
    selectUser(user.id);
    setShowGuestOptions(false);
  };

  const guestUsers = users?.filter(user => user.name.startsWith("Guest ")) || [];

  const formatLastActive = (date: string | null) => {
    if (!date) return "New user";
    return `Last seen: ${new Date(date).toLocaleDateString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animated-mesh-bg flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="text-5xl"
        >
          🦉
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-blue-50 to-pink-100 -z-10" />
      <div className="orb w-80 h-80 bg-purple-200 top-[-80px] right-[-60px] opacity-40" />
      <div className="orb w-64 h-64 bg-blue-200 bottom-[60px] left-[-50px] opacity-35" />

      {/* Help button */}
      <div className="fixed top-4 right-4 z-50">
        <KidHelpButton helpText={HELP_USER_SELECTION} />
      </div>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="text-center pt-10 pb-6 px-4"
      >
        <motion.div
          className="text-7xl mb-3 inline-block"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          👋
        </motion.div>
        <h1 className="text-4xl font-fredoka text-gray-800 mb-1">Who are you?</h1>
        <p className="text-base font-bold text-gray-500">Tap your name to play!</p>
      </motion.header>

      <div className="container mx-auto px-4 max-w-lg pb-16">

        {/* ── Existing users ── */}
        {users && users.length > 0 && (
          <motion.section
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">
              Pick your name
            </p>
            <div className="grid grid-cols-2 gap-4">
              {users.map((user) => (
                <motion.button
                  key={user.id}
                  variants={cardVariants}
                  type="button"
                  onClick={() => selectUser(user.id)}
                  onTouchStart={() => speak(`Hi ${user.name}!`, { rate: 0.85, pitch: 1.2 })}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  className="kid-tile bg-white rounded-[1.75rem] p-5 kid-shadow-strong text-center relative overflow-hidden group"
                >
                  {/* Inner highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent rounded-[1.75rem] pointer-events-none" />

                  {/* Avatar ring */}
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${avatarGradient(user.name)} flex items-center justify-center text-3xl shadow-lg`}>
                    {kidEmoji(user.name)}
                  </div>
                  <p className="text-xl font-fredoka font-bold text-gray-800 leading-tight">{user.name}</p>
                  <p className="text-sm font-bold text-amber-500 mt-1.5">⭐ {user.totalStars}</p>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── New friend section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 26 }}
          className="space-y-3"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            {users && users.length > 0 ? "New friend?" : "Let's start!"}
          </p>

          {!showCreateForm ? (
            <div className="grid grid-cols-1 gap-3">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="kid-tap w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-fredoka font-bold text-xl py-6 rounded-2xl shadow-lg shine-sweep"
                >
                  ➕ Add My Name
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => setShowGuestOptions(true)}
                  variant="outline"
                  className="kid-tap w-full font-fredoka font-bold text-lg py-5 rounded-2xl border-2 border-white/80 bg-white/60 backdrop-blur-sm hover:bg-white/90"
                >
                  👋 Try as Guest
                </Button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 kid-shadow"
            >
              <Label htmlFor="name" className="text-lg font-bold text-gray-700">Your name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
                placeholder="Type your name"
                className="text-center text-2xl font-fredoka py-6 mt-2 border-2 rounded-2xl focus:border-emerald-400"
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                  className="flex-1 kid-tap bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-fredoka font-bold text-lg py-5 rounded-2xl shadow-md"
                >
                  {createUserMutation.isPending ? "..." : "Let's Go! 🎉"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="kid-tap px-5 rounded-2xl border-2 text-lg"
                >
                  ✕
                </Button>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* ── Admin link ── */}
        <div className="text-center mt-10 space-y-2">
          <button
            type="button"
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Grown-ups {showAdmin ? "▲" : "▼"}
          </button>
          {showAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={() => setLocation("/parent-settings?tab=words")}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs border-white/80 bg-white/60 backdrop-blur-sm"
              >
                Grown-ups Settings
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Guest Dialog ── */}
      <Dialog open={showGuestOptions} onOpenChange={setShowGuestOptions}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-fredoka">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                👋
              </div>
              Guest Options
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleCreateNewGuest}
              className="w-full p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all text-center"
            >
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-md">
                ➕
              </div>
              <h3 className="text-xl font-fredoka font-bold text-gray-800">Create New Guest</h3>
              <p className="text-sm text-gray-500 mt-1">Start fresh with a new profile</p>
            </motion.button>

            {guestUsers.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-500 text-center mb-3">Or pick an existing guest:</p>
                <div className="grid grid-cols-2 gap-3">
                  {guestUsers.map((user) => (
                    <motion.button
                      key={user.id}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleSelectGuest(user)}
                      className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all text-center"
                    >
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl shadow-sm">
                        {kidEmoji(user.name)}
                      </div>
                      <p className="text-sm font-fredoka font-bold text-gray-800 truncate">{user.name}</p>
                      <div className="flex justify-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">{user.totalStars} ⭐</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatLastActive(user.lastActive ? String(user.lastActive) : null)}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => setShowGuestOptions(false)}
              className="w-full rounded-xl text-gray-500"
            >
              ← Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
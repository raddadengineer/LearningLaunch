import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
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
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, SpaceStars } from "@/lib/theme";

const KID_EMOJIS = ["🐻", "🐰", "🦊", "🐱", "🐶", "🦁", "🐼", "🐸"];
const AVATAR_GRADIENTS_SPACE  = ["from-orange-500 to-red-600","from-violet-500 to-purple-700","from-teal-400 to-cyan-600","from-pink-500 to-rose-600","from-blue-500 to-indigo-600","from-amber-400 to-orange-500","from-emerald-500 to-teal-600","from-fuchsia-500 to-pink-600"];
const AVATAR_COLORS_FOREST    = ["#DC2626","#D97706","#16A34A","#2563EB","#7C3AED","#DB2777","#0891B2","#65A30D"];
const AVATAR_COLORS_ARCADE    = ["#FF4757","#2ED573","#A55EEA","#1E90FF","#FF6B9D","#FFD700","#00CEC9","#FD79A8"];

function getIdx(name: string) {
  return (name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0)) % 8;
}
function kidEmoji(name: string) { return KID_EMOJIS[getIdx(name)]; }

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  show:   { opacity: 1, y: 0,  scale: 1,  transition: { type: "spring", stiffness: 280, damping: 26 } },
};

export default function UserSelection() {
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", age: 5 });
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(r => r.json()),
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: { name: string; age: number }) => apiRequest("/api/users", "POST", userData),
    onSuccess: async (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      localStorage.setItem("currentUserId", newUser.id.toString());
      try { await hydratePreferencesForUser(newUser.id); } catch {}
      toast({ title: `Welcome ${newUser.name}!` });
      window.location.href = "/";
    },
    onError: () => toast({ title: "Error creating user", variant: "destructive" }),
  });

  const selectUser = async (userId: number) => {
    localStorage.setItem("currentUserId", userId.toString());
    try { await hydratePreferencesForUser(userId); } catch {}
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    window.location.href = "/";
  };

  const handleCreateUser = () => {
    if (!newUser.name.trim()) { toast({ title: "Please enter a name", variant: "destructive" }); return; }
    createUserMutation.mutate(newUser);
  };

  const guestUsers = users?.filter(u => u.name.startsWith("Guest ")) || [];
  const formatLastActive = (date: string | null) => date ? `Last seen: ${new Date(date).toLocaleDateString()}` : "New!";

  /* ─────── Theme helpers ─────── */
  const headingColor =
    theme === "space"  ? "text-white"    :
    theme === "forest" ? "text-amber-900" :
                         "text-white";
  const subColor =
    theme === "space"  ? "text-white/55" :
    theme === "forest" ? "text-amber-700" :
                         "text-white/65";
  const labelColor =
    theme === "space"  ? "text-white/40" :
    theme === "forest" ? "text-amber-600" :
                         "text-white/55";

  /* User card per theme */
  function UserCard({ user }: { user: User }) {
    const idx = getIdx(user.name);

    if (theme === "space") {
      return (
        <motion.button variants={cardVariants} type="button" whileTap={{ scale: 0.91 }} whileHover={{ scale: 1.06, y: -4 }}
          onClick={() => selectUser(user.id)} onTouchStart={() => speak(`Hi ${user.name}!`, { rate: 0.85, pitch: 1.2 })}
          className="kid-tile w-full flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            borderRadius: "50%",
            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
            border: "2.5px solid rgba(160,130,255,0.45)",
            boxShadow: "0 0 24px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15)",
            aspectRatio: "1",
            minHeight: 0,
          }}
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS_SPACE[idx]} flex flex-col items-center justify-center`}>
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.25), transparent 60%)" }} />
            <span className="text-4xl mb-1 relative z-10">{kidEmoji(user.name)}</span>
            <span className="font-fredoka font-bold text-lg text-white relative z-10 px-2 text-center leading-tight" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{user.name}</span>
            <span className="text-xs text-yellow-300 font-bold relative z-10">⭐ {user.totalStars}</span>
          </div>
        </motion.button>
      );
    }

    if (theme === "forest") {
      const color = AVATAR_COLORS_FOREST[idx];
      return (
        <motion.button variants={cardVariants} type="button" whileTap={{ scale: 0.93, y: 3 }} whileHover={{ scale: 1.04, y: -2 }}
          onClick={() => selectUser(user.id)} onTouchStart={() => speak(`Hi ${user.name}!`, { rate: 0.85, pitch: 1.2 })}
          className="kid-tile w-full flex flex-col items-center justify-center bg-amber-50"
          style={{ border: `4px solid ${color}`, boxShadow: `5px 5px 0 ${color}`, borderRadius: "22px" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-md" style={{ background: color }}>
            {kidEmoji(user.name)}
          </div>
          <span className="font-fredoka font-bold text-xl text-gray-800">{user.name}</span>
          <span className="text-sm font-bold mt-1" style={{ color }}>⭐ {user.totalStars}</span>
        </motion.button>
      );
    }

    /* arcade */
    const color = AVATAR_COLORS_ARCADE[idx];
    return (
      <motion.button variants={cardVariants} type="button" whileTap={{ scale: 0.94, y: 5 }} whileHover={{ scale: 1.05, y: -2 }}
        onClick={() => selectUser(user.id)} onTouchStart={() => speak(`Hi ${user.name}!`, { rate: 0.85, pitch: 1.2 })}
        className="kid-tile w-full flex flex-col items-center justify-center"
        style={{ background: color, border: "4px solid rgba(0,0,0,0.3)", boxShadow: "0 7px 0 rgba(0,0,0,0.3)", borderBottomWidth: "7px", borderRadius: "20px" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1/3 rounded-t-[16px]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)" }} />
        <span className="text-4xl mb-1.5 relative z-10">{kidEmoji(user.name)}</span>
        <span className="font-fredoka font-bold text-xl text-white uppercase relative z-10" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}>{user.name}</span>
        <span className="text-sm font-black text-yellow-300 relative z-10 mt-0.5">⭐ {user.totalStars}</span>
      </motion.button>
    );
  }

  /* Add button per theme */
  function AddButton() {
    if (theme === "space") return (
      <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setShowCreateForm(true)}
        className="kid-tap w-full py-5 rounded-[2rem] font-fredoka font-bold text-xl text-white shine-sweep btn-pressable border-b-[5px]"
        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 0 20px rgba(99,102,241,0.4)", borderColor: "rgba(139,92,246,0.5)" }}
      >
        🚀 Add Explorer +
      </motion.button>
    );
    if (theme === "forest") return (
      <motion.button whileTap={{ scale: 0.94, y: 4 }} type="button" onClick={() => setShowCreateForm(true)}
        className="kid-tap w-full py-5 rounded-[2rem] font-fredoka font-bold text-xl text-white"
        style={{ background: "#5A7A2A", border: "4px solid #3E5A1A", boxShadow: "0 6px 0 #3E5A1A" }}
      >
        🌱 Add New Friend +
      </motion.button>
    );
    return (
      <motion.button whileTap={{ scale: 0.95, y: 5 }} type="button" onClick={() => setShowCreateForm(true)}
        className="kid-tap w-full py-5 font-fredoka font-black text-xl text-gray-900 uppercase tracking-wide"
        style={{ background: "#FFE600", border: "4px solid #12082E", boxShadow: "0 7px 0 #12082E", borderBottomWidth: "7px", borderRadius: "20px" }}
      >
        ➕ ADD PLAYER
      </motion.button>
    );
  }

  if (isLoading) return (
    <div className="theme-page min-h-screen relative flex items-center justify-center">
      {theme === "space" && <SpaceStars />}
      <motion.div animate={{ scale: [1,1.15,1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="text-6xl relative z-10">🦉</motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div key={theme} className="theme-page min-h-screen relative overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        {theme === "space" && <SpaceStars />}

        {/* Decorative orbs for forest */}
        {theme === "forest" && (
          <>
            <div className="orb w-72 h-72 bg-yellow-300 top-[-60px] right-[-40px] opacity-30" />
            <div className="orb w-56 h-56 bg-green-300 bottom-[60px] left-[-30px] opacity-25" />
          </>
        )}

        {/* Help */}
        <div className="fixed top-4 right-4 z-50"><KidHelpButton helpText={HELP_USER_SELECTION} /></div>

        {/* ── Header ── */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="text-center pt-10 pb-6 px-4 relative z-10"
        >
          <motion.div className="text-7xl mb-3 inline-block"
            animate={{ y: [0,-12,0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
            {theme === "arcade" ? "🎮" : "👋"}
          </motion.div>
          <h1 className={`text-4xl font-fredoka mb-1 ${headingColor}`}>
            {theme === "space"  ? "Choose Your Explorer!" :
             theme === "forest" ? "Who are you?"          :
                                  "PICK YOUR PLAYER!"}
          </h1>
          <p className={`text-base font-bold ${subColor}`}>
            {theme === "arcade" ? "TAP YOUR CHARACTER!" : "Tap your name to play!"}
          </p>
        </motion.header>

        <div className="container mx-auto px-4 max-w-lg pb-16 relative z-10">

          {/* ── Existing users ── */}
          {users && users.length > 0 && (
            <motion.section className="mb-8" variants={containerVariants} initial="hidden" animate="show">
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 px-1 ${labelColor}`}>
                {theme === "arcade" ? "⚡ CHOOSE CHARACTER" : "Pick your name"}
              </p>
              <div className={`grid grid-cols-2 gap-4 ${theme === "space" ? "gap-6" : ""}`}>
                {users.map((u) => (
                  <div key={u.id} className={theme === "space" ? "aspect-square" : ""}>
                    <UserCard user={u} />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── Create / Add section ── */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest px-1 ${labelColor}`}>
              {users && users.length > 0 ? (theme === "arcade" ? "🆕 NEW PLAYER" : "New friend?") : "Let's start!"}
            </p>

            {!showCreateForm ? (
              <div className="space-y-3">
                <AddButton />
                <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => setShowGuestOptions(true)}
                  className={`kid-tap w-full py-4 font-fredoka font-bold text-lg rounded-2xl transition-all ${
                    theme === "space"  ? "bg-white/10 border border-white/25 text-white hover:bg-white/18" :
                    theme === "forest" ? "bg-amber-100 border-3 border-amber-400 text-amber-800 hover:bg-amber-200" :
                                         "bg-white/20 border-3 border-white/50 text-white hover:bg-white/30"
                  }`}
                  style={theme === "forest" ? { border: "3px solid #D97706" } : {}}
                >
                  👋 {theme === "arcade" ? "TRY AS GUEST" : "Try as Guest"}
                </motion.button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`rounded-3xl p-6 ${
                  theme === "space"  ? "bg-white/8 border border-white/20 backdrop-blur-sm" :
                  theme === "forest" ? "bg-amber-50 border-4 border-amber-400"               :
                                       "bg-white/15 border-3 border-white/40 backdrop-blur-sm"
                }`}
                style={theme === "forest" ? { boxShadow: "4px 4px 0 #92400E" } : {}}
              >
                <label className={`block text-base font-bold mb-2 ${headingColor}`}>
                  {theme === "arcade" ? "ENTER YOUR NAME:" : "Your name"}
                </label>
                <Input
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && handleCreateUser()}
                  placeholder={theme === "arcade" ? "TYPE NAME HERE!" : "Type your name"}
                  autoFocus
                  className={`text-center text-2xl font-fredoka py-6 mt-1 border-2 rounded-2xl ${
                    theme === "space"  ? "bg-white/10 border-white/30 text-white placeholder:text-white/40" :
                    theme === "forest" ? "bg-white border-amber-400 text-gray-900" :
                                         "bg-white/20 border-white/50 text-white placeholder:text-white/50 font-black uppercase"
                  }`}
                />
                <div className="flex gap-3 mt-4">
                  <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                    className={`flex-1 kid-tap font-fredoka font-bold text-lg rounded-2xl ${
                      theme === "space"  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white" :
                      theme === "forest" ? "text-white"  :
                                           "font-black text-gray-900 uppercase"
                    }`}
                    style={
                      theme === "forest" ? { background: "#5A7A2A", border: "3px solid #3E5A1A", boxShadow: "0 4px 0 #3E5A1A" } :
                      theme === "arcade" ? { background: "#FFE600", border: "3px solid #12082E", boxShadow: "0 5px 0 #12082E", borderBottomWidth: "5px" } : {}
                    }
                  >
                    {createUserMutation.isPending ? "..." : (theme === "arcade" ? "GO! 🎮" : "Let's Go! 🎉")}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => setShowCreateForm(false)}
                    className={`kid-tap px-5 rounded-2xl font-fredoka font-bold text-lg ${
                      theme === "space"  ? "bg-white/10 border border-white/25 text-white" :
                      theme === "forest" ? "bg-amber-100 text-amber-800" :
                                           "bg-white/20 text-white border border-white/40"
                    }`}
                  >✕</motion.button>
                </div>
              </motion.div>
            )}
          </motion.section>

          {/* Admin link */}
          <div className="text-center mt-10">
            <button type="button" onClick={() => setShowAdmin(!showAdmin)}
              className={`text-xs font-bold ${subColor}`}>
              Grown-ups {showAdmin ? "▲" : "▼"}
            </button>
            {showAdmin && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                <button type="button" onClick={() => setLocation("/parent-settings?tab=words")}
                  className={`text-xs font-bold px-4 py-2 rounded-xl ${
                    theme === "space"  ? "bg-white/10 text-white border border-white/20" :
                    theme === "forest" ? "bg-amber-100 text-amber-800 border-2 border-amber-300" :
                                         "bg-white/15 text-white border border-white/30"
                  }`}>
                  Grown-ups Settings
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Guest Dialog ── */}
        <Dialog open={showGuestOptions} onOpenChange={setShowGuestOptions}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-fredoka">Guest Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <motion.button whileTap={{ scale: 0.97 }} type="button"
                onClick={() => { createUserMutation.mutate({ name: `Guest ${Math.floor(Math.random()*999)+1}`, age: 5 }); setShowGuestOptions(false); }}
                className="w-full p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 text-center transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">➕</div>
                <h3 className="text-xl font-fredoka font-bold text-gray-800">Create New Guest</h3>
                <p className="text-sm text-gray-500 mt-0.5">Start fresh</p>
              </motion.button>
              {guestUsers.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-center text-gray-500 mb-3">Or pick an existing guest:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {guestUsers.map(u => (
                      <motion.button key={u.id} whileTap={{ scale: 0.95 }} type="button"
                        onClick={() => { selectUser(u.id); setShowGuestOptions(false); }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 text-center transition-all"
                      >
                        <span className="text-3xl">{kidEmoji(u.name)}</span>
                        <p className="text-sm font-fredoka font-bold text-gray-800 mt-1 truncate">{u.name}</p>
                        <Badge variant="secondary" className="text-xs mt-1">{u.totalStars} ⭐</Badge>
                        <p className="text-xs text-gray-400 mt-1">{formatLastActive(u.lastActive ? String(u.lastActive) : null)}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              <button type="button" onClick={() => setShowGuestOptions(false)}
                className="w-full py-3 rounded-xl text-center text-gray-500 font-bold hover:bg-gray-50">
                ← Back
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}
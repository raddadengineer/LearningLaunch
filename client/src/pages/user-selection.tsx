import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const KID_EMOJIS = ["🐻", "🐰", "🦊", "🐱", "🐶", "🦁", "🐼", "🐸"];

function kidEmoji(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
  return KID_EMOJIS[code % KID_EMOJIS.length];
}

export default function UserSelection() {
  const [location, setLocation] = useLocation();
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
        variant: "destructive" 
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
    // Create a temporary guest user with friendly name
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
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <div className="fixed top-4 right-4 z-50">
        <KidHelpButton helpText={HELP_USER_SELECTION} />
      </div>
      {/* Header */}
      <header className="text-center py-8 px-4">
        <div className="text-6xl mb-3">👋</div>
        <h1 className="text-4xl font-fredoka text-gray-800 mb-2">Who are you?</h1>
        <p className="text-lg font-bold text-gray-500">Tap your name to play!</p>
      </header>

      <div className="container mx-auto px-4 max-w-lg pb-12">
        {users && users.length > 0 && (
          <section className="mb-10">
            <div className="grid grid-cols-2 gap-4">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectUser(user.id)}
                  onTouchStart={() => speak(`Hi ${user.name}!`, { rate: 0.85, pitch: 1.2 })}
                  className="kid-tile bg-white rounded-[2rem] p-6 kid-shadow text-center hover:scale-[1.02] active:scale-95 transition-transform border-2 border-transparent hover:border-coral/30"
                >
                  <div className="text-5xl mb-3">{kidEmoji(user.name)}</div>
                  <p className="text-2xl font-fredoka font-bold text-gray-800">{user.name}</p>
                  <p className="text-sm font-bold text-yellow-600 mt-1">⭐ {user.totalStars}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-xl font-fredoka text-gray-700 text-center">
            {users && users.length > 0 ? "New friend?" : "Let's start!"}
          </h2>

          {!showCreateForm ? (
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="kid-tap w-full bg-green-500 hover:bg-green-600 text-white font-fredoka font-bold text-xl py-6 rounded-2xl kid-shadow"
              >
                ➕ Add My Name
              </Button>
              <Button
                onClick={() => setShowGuestOptions(true)}
                variant="outline"
                className="kid-tap w-full font-fredoka font-bold text-lg py-5 rounded-2xl border-2"
              >
                👋 Try as Guest
              </Button>
            </div>
          ) : (
            <Card className="bg-white rounded-2xl p-6 kid-shadow">
              <CardContent className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="name" className="text-lg font-bold">Your name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Type your name"
                    className="text-center text-2xl font-fredoka py-6 mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                    className="flex-1 kid-tap bg-green-500 hover:bg-green-600 text-white font-fredoka font-bold text-lg py-5 rounded-2xl"
                  >
                    Let's Go! 🎉
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)} className="kid-tap px-4 rounded-2xl">
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        <div className="text-center mt-10 space-y-2">
          <button
            type="button"
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-xs font-bold text-gray-400"
          >
            Grown-ups {showAdmin ? "▲" : "▼"}
          </button>
          {showAdmin && (
            <Button onClick={() => setLocation("/parent-settings?tab=words")} variant="outline" size="sm" className="rounded-xl text-xs">
              Grown-ups Settings
            </Button>
          )}
        </div>

        {/* Guest User Options Dialog */}
        <Dialog open={showGuestOptions} onOpenChange={setShowGuestOptions}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-2xl">
                  👋
                </div>
                Guest User Options
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Create New Guest Button */}
              <Card 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50"
                onClick={handleCreateNewGuest}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-2xl">
                    ➕
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Create New Guest</h3>
                  <p className="text-gray-600">Start fresh with a new guest profile</p>
                </CardContent>
              </Card>

              {/* Existing Guest Users */}
              {guestUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Or select an existing guest:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guestUsers.map((user) => (
                      <Card 
                        key={user.id}
                        className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50"
                        onClick={() => handleSelectGuest(user)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-lg">
                            👤
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{user.name}</h3>
                          <div className="flex justify-center items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {user.totalStars} stars
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Age {user.age}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{formatLastActive(user.lastActive)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowGuestOptions(false)}
                  className="flex items-center gap-2"
                >
                  ← Back to Main Menu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
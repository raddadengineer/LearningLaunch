import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { hydratePreferencesForUser } from "@/lib/voice-preferences";
import type { User, UserProgress } from "@shared/schema";
import { Link } from "wouter";
import { useTheme, getThemeIcon } from "@/lib/theme";

export default function UserManagement() {
  const { theme } = useTheme();
  const [newUser, setNewUser] = useState({ name: "", age: 5 });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()),
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress", selectedUserId],
    queryFn: () => selectedUserId ? fetch(`/api/user/${selectedUserId}/progress`).then(res => res.json()) : [],
    enabled: !!selectedUserId,
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: { name: string; age: number }) =>
      apiRequest("/api/users", "POST", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setNewUser({ name: "", age: 5 });
      toast({ title: "User created successfully" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/users/${userId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setSelectedUserId(null);
      toast({ title: "User deleted successfully" });
    },
  });

  const clearProgressMutation = useMutation({
    mutationFn: ({ userId, type }: { userId: number; type?: string }) =>
      type 
        ? apiRequest(`/api/user/${userId}/progress/${type}`, "DELETE")
        : apiRequest(`/api/user/${userId}/progress`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      toast({ title: "Progress cleared successfully" });
    },
  });

  const switchUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest(`/api/user/${userId}/activate`, "POST"),
    onSuccess: async (data) => {
      localStorage.setItem("currentUserId", data.id.toString());
      try {
        await hydratePreferencesForUser(data.id);
      } catch (error) {
        console.warn("Could not load voice preferences:", error);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Switched user successfully" });
    },
  });

  const handleCreateUser = () => {
    if (!newUser.name.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const formatLastActive = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  if (usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-page">
        <p className="font-bold text-lg">Loading users...</p>
      </div>
    );
  }

  // Theme styling helpers
  const isSpace = theme === "space";
  const isForest = theme === "forest";
  const isArcade = theme === "arcade";

  const titleClass = isSpace
    ? "text-xl sm:text-2xl font-fredoka text-violet-300"
    : isForest
    ? "text-xl sm:text-2xl font-fredoka text-[#78350F]"
    : "text-xl sm:text-2xl font-fredoka text-[#12082E]";

  const cardClass = "theme-card border-0 overflow-hidden shadow-lg p-5 sm:p-6 mb-4";
  const textMuted = isSpace ? "text-violet-300" : isForest ? "text-[#78350F]/80" : "text-gray-600";
  const textPrimary = isSpace ? "text-white" : isForest ? "text-[#78350F]" : "text-gray-800";

  const inputClass = "theme-input font-bold w-full";
  const selectTriggerClass = isSpace
    ? "w-full font-bold bg-slate-950/40 border border-violet-500/35 text-white rounded-xl"
    : isForest
    ? "w-full font-bold bg-[#FEF9E7] border-3 border-[#D97706] text-[#78350F] rounded-xl"
    : "w-full font-bold bg-white border-4 border-[#12082E] text-[#12082E] rounded-xl";

  const tabsListClass = isSpace
    ? "grid w-full grid-cols-2 bg-slate-950/30 p-1 rounded-xl border border-violet-500/20 mb-6"
    : isForest
    ? "grid w-full grid-cols-2 bg-[#FEF3C7] p-1 border-3 border-[#D97706] rounded-xl mb-6"
    : "grid w-full grid-cols-2 bg-slate-100 p-1 border-4 border-[#12082E] rounded-xl mb-6";

  const tabTriggerClass = isSpace
    ? "data-[state=active]:bg-violet-600 data-[state=active]:text-white font-fredoka py-2 rounded-lg text-slate-400"
    : isForest
    ? "data-[state=active]:bg-[#D97706] data-[state=active]:text-white font-fredoka py-2 rounded-lg text-[#78350F]"
    : "data-[state=active]:bg-[#12082E] data-[state=active]:text-white font-fredoka py-2 rounded-lg text-[#12082E]";

  // Buttons styling
  const primaryBtnClass = isSpace
    ? "bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
    : isForest
    ? "bg-[#16A34A] hover:bg-[#15803D] text-white border-3 border-[#14532D] shadow-[2px_2px_0_#14532D] font-bold rounded-xl"
    : "bg-[#2ED573] hover:bg-[#27AE60] text-white border-4 border-[#12082E] shadow-[3px_3px_0_#12082E] font-bold rounded-xl";

  const normalBtnClass = isSpace
    ? "bg-violet-700 hover:bg-violet-600 text-white font-bold rounded-xl"
    : isForest
    ? "bg-[#D97706] hover:bg-[#B45309] border-3 border-[#92400E] shadow-[2px_2px_0_#92400E] text-white font-bold rounded-xl"
    : "bg-[#FFE600] hover:bg-[#E6CE00] text-[#12082E] border-4 border-[#12082E] shadow-[3px_3px_0_#12082E] font-bold rounded-xl";

  const cancelBtnClass = isSpace
    ? "border border-violet-500/40 text-violet-300 hover:bg-violet-950/40 bg-transparent rounded-xl font-bold"
    : isForest
    ? "bg-[#FFFBEB] border-3 border-[#D97706] text-[#78350F] hover:bg-[#FEF3C7] shadow-[2px_2px_0_#92400E] font-bold rounded-xl"
    : "bg-white border-4 border-[#12082E] text-[#12082E] hover:bg-slate-100 shadow-[3px_3px_0_#12082E] font-bold rounded-xl";

  const deleteBtnClass = isSpace
    ? "bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
    : isForest
    ? "bg-red-600 hover:bg-red-700 border-3 border-red-800 text-white font-bold rounded-xl shadow-[2px_2px_0_red]"
    : "bg-red-500 hover:bg-red-600 text-white border-4 border-[#12082E] shadow-[3px_3px_0_#12082E] font-bold rounded-xl";

  const innerPanelClass = isSpace
    ? "mt-4 space-y-3 border-t border-violet-500/10 pt-4"
    : isForest
    ? "mt-4 space-y-3 border-t border-[#D97706]/10 pt-4"
    : "mt-4 space-y-3 border-t-2 border-[#12082E] pt-4";

  return (
    <div className="theme-page min-h-screen pb-24">
      {/* Header */}
      <div className="theme-header px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-200">
        <h1 className={titleClass}>👥 User Management</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/parent-settings?tab=words"}
            className={cancelBtnClass}
          >
            ⚙️ Settings
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/"}
            className={cancelBtnClass}
          >
            Home
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className={tabsListClass}>
            <TabsTrigger value="users" className={tabTriggerClass}>Manage Users</TabsTrigger>
            <TabsTrigger value="create" className={tabTriggerClass}>Create New User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users?.map((user) => (
                <Card key={user.id} className={cardClass}>
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className={`flex items-center justify-between font-fredoka text-xl ${textPrimary}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="text-2xl">{getThemeIcon(theme, "gate")}</span>
                        {user.name}
                      </span>
                      <Badge className={isSpace ? "bg-violet-950/40 text-violet-300 border border-violet-500/20" : isForest ? "bg-[#FEF3C7] text-[#78350F]" : "bg-slate-100 text-[#12082E] border-2 border-[#12082E]"}>
                        {user.age} yrs
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="space-y-1.5 text-sm">
                      <p className={textMuted}>
                        Total Stars: <span className="font-bold text-amber-500">⭐ {user.totalStars}</span>
                      </p>
                      {user.lastActive && (
                        <p className={textMuted}>
                          Last Active: {formatLastActive(user.lastActive)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        onClick={() => switchUserMutation.mutate(user.id)}
                        disabled={switchUserMutation.isPending}
                        className={`w-full ${primaryBtnClass}`}
                      >
                        Switch to {user.name}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full ${normalBtnClass}`}
                      >
                        View Progress
                      </Button>
                    </div>

                    {selectedUserId === user.id && (
                      <div className={innerPanelClass}>
                        <h4 className={`font-fredoka text-base ${textPrimary}`}>Progress Management</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => clearProgressMutation.mutate({ userId: user.id, type: "reading" })}
                            disabled={clearProgressMutation.isPending}
                            className={cancelBtnClass}
                          >
                            Clear Reading
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => clearProgressMutation.mutate({ userId: user.id, type: "math" })}
                            disabled={clearProgressMutation.isPending}
                            className={cancelBtnClass}
                          >
                            Clear Math
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => clearProgressMutation.mutate({ userId: user.id })}
                          disabled={clearProgressMutation.isPending}
                          className={`w-full ${cancelBtnClass}`}
                        >
                          Clear All Progress
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${user.name}? This cannot be undone.`)) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                          disabled={deleteUserMutation.isPending}
                          className={`w-full ${deleteBtnClass}`}
                        >
                          Delete User
                        </Button>
                      </div>
                    )}

                    {selectedUserId === user.id && userProgress && (
                      <div className={innerPanelClass}>
                        <h4 className={`font-fredoka text-base ${textPrimary}`}>Current Progress</h4>
                        {userProgress.length === 0 ? (
                          <p className="text-xs opacity-75">No progress recorded yet.</p>
                        ) : (
                          <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                            {userProgress.map((progress) => (
                              <div key={progress.id} className={`flex justify-between p-2 rounded-lg bg-black/10 font-bold ${textPrimary}`}>
                                <span className="capitalize">{progress.activityType} (Lvl {progress.level})</span>
                                <span>{progress.stars} ⭐</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {users?.length === 0 && (
                <p className={`col-span-3 text-center py-8 font-semibold ${textMuted}`}>No child profiles created yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4 mt-4">
            <Card className={`${cardClass} max-w-md mx-auto`}>
              <CardHeader>
                <CardTitle className={`font-fredoka text-xl ${textPrimary}`}>Create New User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="new-name" className="font-bold">Child's Name</Label>
                  <Input
                    id="new-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter child's name"
                    className={inputClass}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="new-age" className="font-bold">Age</Label>
                  <Select value={newUser.age.toString()} onValueChange={(value) => setNewUser({...newUser, age: parseInt(value)})}>
                    <SelectTrigger id="new-age" className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 years old</SelectItem>
                      <SelectItem value="4">4 years old</SelectItem>
                      <SelectItem value="5">5 years old</SelectItem>
                      <SelectItem value="6">6 years old</SelectItem>
                      <SelectItem value="7">7 years old</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                  className={`w-full py-5 text-base mt-4 ${primaryBtnClass}`}
                >
                  Create User
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
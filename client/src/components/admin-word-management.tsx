import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageSearch from "@/components/image-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ReadingWord } from "@shared/schema";
import { Link } from "wouter";
import { useTheme, getThemeIcon } from "@/lib/theme";

export function AdminWordManagement() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [selectedLevel, setSelectedLevel] = useState("1");
  const [editingWord, setEditingWord] = useState<ReadingWord | null>(null);
  const [newWord, setNewWord] = useState({ word: "", imageUrl: "", level: 1 });
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("adminAuthenticated") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const { data: words, isLoading } = useQuery<ReadingWord[]>({
    queryKey: ["/api/reading/words/all"],
    queryFn: () => fetch("/api/reading/words/all").then((res) => res.json()),
    enabled: isAuthenticated,
  });

  const invalidateWordsQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/reading/words/all"] });
    queryClient.invalidateQueries({ queryKey: ["/api/reading/words"] });
  };

  const updateWordMutation = useMutation({
    mutationFn: (data: { id: number; word: string; imageUrl: string; level: number }) =>
      apiRequest(`/api/reading/words/${data.id}`, "PUT", data),
    onSuccess: () => {
      invalidateWordsQueries();
      setEditingWord(null);
      toast({ title: "Word updated successfully" });
    },
  });

  const addWordMutation = useMutation({
    mutationFn: (data: { word: string; imageUrl: string; level: number }) =>
      apiRequest("/api/reading/words", "POST", data),
    onSuccess: () => {
      invalidateWordsQueries();
      setNewWord({ word: "", imageUrl: "", level: 1 });
      toast({ title: "Word added successfully" });
    },
  });

  const deleteWordMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/reading/words/${id}`, "DELETE"),
    onSuccess: () => {
      invalidateWordsQueries();
      toast({ title: "Word deleted successfully" });
    },
  });

  const handleLogin = () => {
    if (credentials.username === "admin" && credentials.password === "admin123") {
      localStorage.setItem("adminAuthenticated", "true");
      setIsAuthenticated(true);
      toast({ title: "Welcome, Administrator!" });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Use admin/admin123",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
    setCredentials({ username: "", password: "" });
    toast({ title: "Logged out successfully" });
  };

  const filteredWords = words?.filter((word) => word.level === parseInt(selectedLevel)) || [];

  const handleUpdateWord = (word: ReadingWord) => {
    updateWordMutation.mutate({
      id: word.id,
      word: word.word,
      imageUrl: word.imageUrl ?? "",
      level: word.level,
    });
  };

  const handleAddWord = () => {
    if (!newWord.word || !newWord.imageUrl) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    addWordMutation.mutate(newWord);
  };

  // Theme support
  const isSpace = theme === "space";
  const isForest = theme === "forest";
  const isArcade = theme === "arcade";

  const cardClass = "theme-card border-0 overflow-hidden shadow-lg mb-4";
  const loginCardClass = isSpace
    ? "theme-card border border-violet-500/25 bg-slate-950/40 rounded-3xl p-6 shadow-xl max-w-md mx-auto"
    : isForest
    ? "theme-card border-3 border-[#D97706] bg-[#FFFBEB] rounded-3xl p-6 shadow-[5px_5px_0_#92400E] max-w-md mx-auto"
    : "theme-card border-4 border-[#12082E] bg-white rounded-3xl p-6 shadow-[8px_8px_0_#12082E] max-w-md mx-auto";

  const textMuted = isSpace ? "text-violet-300" : isForest ? "text-[#78350F]/80" : "text-gray-600";
  const textMutedXs = isSpace ? "text-violet-300/60 text-xs" : isForest ? "text-[#78350F]/60 text-xs" : "text-gray-500 text-xs";
  const textPrimary = isSpace ? "text-white" : isForest ? "text-[#78350F]" : "text-gray-800";

  const inputClass = "theme-input font-bold w-full";
  const selectTriggerClass = isSpace
    ? "w-40 font-bold bg-slate-950/40 border border-violet-500/35 text-white rounded-xl"
    : isForest
    ? "w-40 font-bold bg-[#FEF9E7] border-3 border-[#D97706] text-[#78350F] rounded-xl"
    : "w-40 font-bold bg-white border-4 border-[#12082E] text-[#12082E] rounded-xl";

  const tabsListClass = isSpace
    ? "grid w-full grid-cols-2 bg-slate-950/30 p-1 rounded-xl border border-violet-500/20"
    : isForest
    ? "grid w-full grid-cols-2 bg-[#FEF3C7] p-1 border-3 border-[#D97706] rounded-xl"
    : "grid w-full grid-cols-2 bg-slate-100 p-1 border-4 border-[#12082E] rounded-xl";

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

  const imgCardBg = isSpace
    ? "bg-slate-900/60 border border-violet-500/10"
    : isForest
    ? "bg-[#FEF9E7] border border-[#D97706]/20"
    : "bg-slate-50 border border-slate-300";

  if (!isAuthenticated) {
    return (
      <div className="py-6">
        <Card className={`${loginCardClass} border-0 overflow-hidden`}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-fredoka text-xl flex items-center justify-center gap-2 text-inherit">
              <span>🔐</span> Administrator Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className={`${textMuted} text-center`}>
              Word management requires administrator credentials.
            </p>
            <div className="space-y-1">
              <Label htmlFor="admin-username" className="font-bold">Username</Label>
              <Input
                id="admin-username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter username"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-password" className="font-bold">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter password"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className={`w-full py-5 text-base mt-2 ${primaryBtnClass}`}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <p className={`p-4 font-bold text-center ${textMuted}`}>Loading words...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 justify-end items-center">
        <Link href="/users">
          <Button variant="outline" size="sm" className={cancelBtnClass}>
            👥 User Management
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className={`${deleteBtnClass} !shadow-none px-4`}
        >
          Logout
        </Button>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className={tabsListClass}>
          <TabsTrigger value="manage" className={tabTriggerClass}>Manage Words</TabsTrigger>
          <TabsTrigger value="add" className={tabTriggerClass}>Add New Word</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4 mt-5">
          <div className="flex flex-wrap items-center gap-3 bg-black/5 p-3 rounded-2xl">
            <Label htmlFor="level-select" className={`font-fredoka text-sm ${textPrimary}`}>Select Level:</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger id="level-select" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
                <SelectItem value="6">Level 6: Sentences</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredWords.map((word) => (
              <Card key={word.id} className={`${cardClass} flex flex-col`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg font-fredoka ${textPrimary}`}>{word.word}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className={`aspect-square w-full rounded-xl overflow-hidden max-h-44 ${imgCardBg} flex items-center justify-center`}>
                    <img
                      src={word.imageUrl ?? ""}
                      alt={word.word}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/300x300?text=Image+Not+Found";
                      }}
                    />
                  </div>

                  {editingWord?.id === word.id ? (
                    <div className="space-y-2 pt-2">
                      <Input
                        value={editingWord.word}
                        onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                        placeholder="Word"
                        className={inputClass}
                      />
                      <Input
                        value={editingWord.imageUrl ?? ""}
                        onChange={(e) => setEditingWord({ ...editingWord, imageUrl: e.target.value })}
                        placeholder="Image URL"
                        className={inputClass}
                      />
                      <div className="py-1">
                        <ImageSearch
                          searchTerm={editingWord.word}
                          onImageSelect={(imageUrl) => setEditingWord({ ...editingWord, imageUrl })}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={() => handleUpdateWord(editingWord)}
                          disabled={updateWordMutation.isPending}
                          size="sm"
                          className={`flex-1 ${primaryBtnClass}`}
                        >
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingWord(null)} size="sm" className={cancelBtnClass}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1 flex flex-col justify-end">
                      <p className={`${textMutedXs} break-all line-clamp-2 min-h-[2rem]`}>{word.imageUrl}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditingWord(word)} size="sm" className={`flex-1 ${normalBtnClass}`}>
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Delete "${word.word}"?`)) {
                              deleteWordMutation.mutate(word.id);
                            }
                          }}
                          disabled={deleteWordMutation.isPending}
                          size="sm"
                          className={`flex-1 ${deleteBtnClass}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredWords.length === 0 && (
              <p className={`col-span-2 text-center py-8 font-semibold ${textMuted}`}>No custom words added for this level yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4 mt-5">
          <Card className={`${cardClass} max-w-lg mx-auto`}>
            <CardHeader>
              <CardTitle className={`font-fredoka text-xl ${textPrimary}`}>Add New Word</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="new-word" className="font-bold">Word</Label>
                <Input
                  id="new-word"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value.toUpperCase() })}
                  placeholder="Enter word"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-image" className="font-bold">Image URL</Label>
                <Input
                  id="new-image"
                  value={newWord.imageUrl}
                  onChange={(e) => setNewWord({ ...newWord, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
                <div className="py-1">
                  <ImageSearch
                    searchTerm={newWord.word}
                    onImageSelect={(imageUrl) => setNewWord({ ...newWord, imageUrl })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-level" className="font-bold">Level</Label>
                <Select
                  value={newWord.level.toString()}
                  onValueChange={(value) => setNewWord({ ...newWord, level: parseInt(value) })}
                >
                  <SelectTrigger id="new-level" className={selectTriggerClass + " w-full"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                    <SelectItem value="6">Level 6: Simple Sentences</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newWord.imageUrl && (
                <div className="space-y-1.5 pt-2">
                  <Label className="font-bold">Image Preview</Label>
                  <div className={`aspect-square w-32 rounded-xl overflow-hidden ${imgCardBg} flex items-center justify-center shadow-md`}>
                    <img
                      src={newWord.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/300x300?text=Invalid+URL";
                      }}
                    />
                  </div>
                </div>
              )}
              <Button onClick={handleAddWord} disabled={addWordMutation.isPending} className={`w-full py-5 text-base mt-4 ${primaryBtnClass}`}>
                Add Word
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

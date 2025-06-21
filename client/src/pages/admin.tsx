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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [selectedLevel, setSelectedLevel] = useState("1");
  const [editingWord, setEditingWord] = useState<ReadingWord | null>(null);
  const [newWord, setNewWord] = useState({ word: "", imageUrl: "", level: 1 });
  const { toast } = useToast();

  // Always call hooks first - check authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuthenticated");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Always call all hooks
  const { data: words, isLoading } = useQuery<ReadingWord[]>({
    queryKey: ["/api/reading/words/all"],
    queryFn: () => fetch("/api/reading/words/all").then(res => res.json()),
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const updateWordMutation = useMutation({
    mutationFn: (data: { id: number; word: string; imageUrl: string; level: number }) => 
      apiRequest(`/api/reading/words/${data.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading/words"] });
      setEditingWord(null);
      toast({ title: "Word updated successfully" });
    },
  });

  const addWordMutation = useMutation({
    mutationFn: (data: { word: string; imageUrl: string; level: number }) =>
      apiRequest("/api/reading/words", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading/words"] });
      setNewWord({ word: "", imageUrl: "", level: 1 });
      toast({ title: "Word added successfully" });
    },
  });

  const deleteWordMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/reading/words/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading/words"] });
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
        variant: "destructive" 
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
    setCredentials({ username: "", password: "" });
    toast({ title: "Logged out successfully" });
  };

  const filteredWords = words?.filter(word => word.level === parseInt(selectedLevel)) || [];

  const handleUpdateWord = (word: ReadingWord) => {
    updateWordMutation.mutate({
      id: word.id,
      word: word.word,
      imageUrl: word.imageUrl,
      level: word.level
    });
  };

  const handleAddWord = () => {
    if (!newWord.word || !newWord.imageUrl) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    addWordMutation.mutate(newWord);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-2xl">
                🔐
              </div>
              Administrator Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="Enter password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="text-center text-sm text-gray-600 p-3 bg-gray-50 rounded">
              <p><strong>Default Credentials:</strong></p>
              <p>Username: admin</p>
              <p>Password: admin123</p>
            </div>
            
            <Button 
              onClick={handleLogin}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3"
            >
              Login
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Back to Main
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/users"}
            >
              User Management
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/"}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Word Management Admin</h1>
      
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Words</TabsTrigger>
          <TabsTrigger value="add">Add New Word</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="level-select">Select Level:</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => (
              <Card key={word.id} className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">{word.word}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={word.imageUrl} 
                      alt={word.word}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x300?text=Image+Not+Found";
                      }}
                    />
                  </div>
                  
                  {editingWord?.id === word.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingWord.word}
                        onChange={(e) => setEditingWord({...editingWord, word: e.target.value})}
                        placeholder="Word"
                      />
                      <Input
                        value={editingWord.imageUrl}
                        onChange={(e) => setEditingWord({...editingWord, imageUrl: e.target.value})}
                        placeholder="Image URL"
                      />
                      <ImageSearch 
                        searchTerm={editingWord.word}
                        onImageSelect={(imageUrl) => setEditingWord({...editingWord, imageUrl})}
                      />
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleUpdateWord(editingWord)}
                          disabled={updateWordMutation.isPending}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingWord(null)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 break-all">{word.imageUrl}</p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingWord(word)}
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => deleteWordMutation.mutate(word.id)}
                          disabled={deleteWordMutation.isPending}
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Add New Word</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-word">Word</Label>
                <Input
                  id="new-word"
                  value={newWord.word}
                  onChange={(e) => setNewWord({...newWord, word: e.target.value.toUpperCase()})}
                  placeholder="Enter word"
                />
              </div>
              
              <div>
                <Label htmlFor="new-image">Image URL</Label>
                <Input
                  id="new-image"
                  value={newWord.imageUrl}
                  onChange={(e) => setNewWord({...newWord, imageUrl: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                />
                <ImageSearch 
                  searchTerm={newWord.word}
                  onImageSelect={(imageUrl) => setNewWord({...newWord, imageUrl})}
                />
              </div>
              
              <div>
                <Label htmlFor="new-level">Level</Label>
                <Select value={newWord.level.toString()} onValueChange={(value) => setNewWord({...newWord, level: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newWord.imageUrl && (
                <div className="aspect-square w-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={newWord.imageUrl} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x300?text=Invalid+URL";
                    }}
                  />
                </div>
              )}
              
              <Button 
                onClick={handleAddWord}
                disabled={addWordMutation.isPending}
                className="w-full"
              >
                Add Word
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
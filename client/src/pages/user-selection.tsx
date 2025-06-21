import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";

export default function UserSelection() {
  const [location, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", age: 5 });
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()),
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: { name: string; age: number }) =>
      apiRequest("/api/users", "POST", userData),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      localStorage.setItem("currentUserId", newUser.id.toString());
      toast({ title: `Welcome ${newUser.name}!` });
      setLocation("/");
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

  const selectUser = (userId: number) => {
    localStorage.setItem("currentUserId", userId.toString());
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    toast({ title: `Welcome back!` });
    setLocation("/");
  };

  const handleCreateUser = () => {
    if (!newUser.name.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleGuestLogin = () => {
    // Create a temporary guest user with unique name
    const guestName = `Guest_${Date.now()}`;
    createUserMutation.mutate({ name: guestName, age: 5 });
  };

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
      {/* Header */}
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          🌟 Learning Adventure 🌟
        </h1>
        <p className="text-xl text-gray-600">Choose your profile to start learning!</p>
      </header>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Existing Users */}
        {users && users.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-700 text-center mb-8">
              Welcome Back! 👋
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card 
                  key={user.id} 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-2 border-gray-200 hover:border-blue-300"
                  onClick={() => selectUser(user.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      {user.name}
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="secondary">{user.age} years old</Badge>
                      <Badge variant="outline" className="text-yellow-600">
                        ⭐ {user.totalStars}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      {formatLastActive(user.lastActive)}
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl"
                    >
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Create New User or Guest Options */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-700 mb-8">
            {users && users.length > 0 ? "Or Start Fresh!" : "Let's Get Started!"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create New Profile */}
            <Card className="bg-white border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  Create New Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showCreateForm ? (
                  <>
                    <div>
                      <Label htmlFor="name">Child's Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        placeholder="Enter name"
                        className="text-center text-lg"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <div className="flex justify-center gap-2 mt-2">
                        {[3, 4, 5, 6, 7].map((age) => (
                          <Button
                            key={age}
                            variant={newUser.age === age ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewUser({...newUser, age})}
                            className="w-12 h-12 rounded-full"
                          >
                            {age}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateUser}
                        disabled={createUserMutation.isPending}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
                      >
                        Create Profile
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        className="px-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg"
                  >
                    Create New Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Guest Mode */}
            <Card className="bg-white border-2 border-orange-200 hover:border-orange-400 transition-colors">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-2xl">
                    👋
                  </div>
                  Try as Guest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  Explore the app without saving progress
                </p>
                <Button 
                  onClick={handleGuestLogin}
                  disabled={createUserMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg"
                >
                  Continue as Guest
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>


      </div>
    </div>
  );
}
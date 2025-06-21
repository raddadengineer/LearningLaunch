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
import type { User, UserProgress } from "@shared/schema";
import { Link } from "wouter";

export default function UserManagement() {
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
    onSuccess: (data) => {
      localStorage.setItem("currentUserId", data.id.toString());
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
    return <div className="p-6">Loading users...</div>;
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/admin"}
            >
              Admin Panel
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
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="create">Create New User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users?.map((user) => (
              <Card key={user.id} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{user.name}</span>
                    <Badge variant="secondary">{user.age} years old</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Total Stars: <span className="font-bold text-yellow-500">{user.totalStars}</span>
                    </p>
                    {user.lastActive && (
                      <p className="text-sm text-gray-600">
                        Last Active: {formatLastActive(user.lastActive)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={() => switchUserMutation.mutate(user.id)}
                      disabled={switchUserMutation.isPending}
                      className="w-full"
                    >
                      Switch to {user.name}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedUserId(user.id)}
                      className="w-full"
                    >
                      View Progress
                    </Button>
                  </div>

                  {selectedUserId === user.id && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <h4 className="font-semibold">Progress Management</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => clearProgressMutation.mutate({ userId: user.id, type: "reading" })}
                          disabled={clearProgressMutation.isPending}
                        >
                          Clear Reading
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => clearProgressMutation.mutate({ userId: user.id, type: "math" })}
                          disabled={clearProgressMutation.isPending}
                        >
                          Clear Math
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => clearProgressMutation.mutate({ userId: user.id })}
                        disabled={clearProgressMutation.isPending}
                        className="w-full"
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
                        className="w-full"
                      >
                        Delete User
                      </Button>
                    </div>
                  )}

                  {selectedUserId === user.id && userProgress && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <h4 className="font-semibold">Current Progress</h4>
                      {userProgress.length === 0 ? (
                        <p className="text-sm text-gray-500">No progress yet</p>
                      ) : (
                        <div className="space-y-1">
                          {userProgress.map((progress) => (
                            <div key={progress.id} className="flex justify-between text-sm">
                              <span>{progress.activityType} Level {progress.level}</span>
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
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-name">Child's Name</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter child's name"
                />
              </div>
              
              <div>
                <Label htmlFor="new-age">Age</Label>
                <Select value={newUser.age.toString()} onValueChange={(value) => setNewUser({...newUser, age: parseInt(value)})}>
                  <SelectTrigger>
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
                className="w-full"
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
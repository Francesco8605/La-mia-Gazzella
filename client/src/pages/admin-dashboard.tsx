import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Activity, TrendingUp, Search, Calendar, MessageSquare, FileText, ChevronDown, ChevronRight, Clock, Utensils } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
  createdAt: string;
  lastActivity: string;
  lastAction: string;
  profile: {
    age?: number;
    weight?: number;
    height?: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalMealPlans: number;
  totalRecipes: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData(data.admin);
        setIsAuthenticated(true);
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_email", data.admin.email);
      } else {
        alert("Credenziali non valide");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Errore di login");
    }
  };

  // Check existing session
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const email = localStorage.getItem("admin_email");
    if (token && email) {
      setIsAuthenticated(true);
      setAdminData({ id: "", email, name: "Admin", role: "admin" });
    }
  }, []);

  // API helper with auth headers
  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem("admin_token");
    const email = localStorage.getItem("admin_email");
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Admin-Email": email || "",
      },
    });
  };

  // Fetch dashboard stats
  const { data: stats } = useQuery<{ stats: DashboardStats; recentActivity: ActivityLog[] }>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/admin/stats");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch users list
  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/admin/users");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch selected user details
  const { data: userDetails } = useQuery({
    queryKey: ["/api/admin/users", selectedUserId],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/admin/users/${selectedUserId}`);
      return response.json();
    },
    enabled: isAuthenticated && !!selectedUserId,
  });

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    setIsAuthenticated(false);
    setAdminData(null);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-red-600">🔒 ADMIN DASHBOARD SISTEMA</CardTitle>
            <CardDescription className="text-orange-600 font-bold">⚠️ ACCESSO RISERVATO AL TEAM - VERSIONE ADMIN ⚠️</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email amministratore"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  data-testid="admin-email-input"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  data-testid="admin-password-input"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="admin-login-button">
                <Shield className="w-4 h-4 mr-2" />
                Accedi alla Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = usersData?.users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Admin</h1>
            <p className="text-slate-600">Benvenuto, {adminData?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" data-testid="admin-logout-button">
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats.totalUsers || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abbonamenti Attivi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats.activeSubscriptions || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Piani Alimentari</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats.totalMealPlans || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ricette Generate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.stats.totalRecipes || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="user-detail" disabled={!selectedUserId}>Dettaglio Utente</TabsTrigger>
            <TabsTrigger value="activity">Attività Recente</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista Utenti</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Cerca per email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                    data-testid="search-users"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Stato Abbonamento</TableHead>
                      <TableHead>Ultima Attività</TableHead>
                      <TableHead>Registrazione</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                            {user.subscriptionStatus || 'Nessun abbonamento'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('it-IT') : 'Mai'}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setActiveTab("user-detail");
                            }}
                            data-testid={`view-user-${user.id}`}
                          >
                            Visualizza
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-detail" className="space-y-6">
            {userDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informazioni Utente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Email:</strong> {userDetails.user.email}</p>
                    <p><strong>Stato:</strong> {userDetails.user.subscriptionStatus || 'Nessun abbonamento'}</p>
                    <p><strong>Trial usato:</strong> {userDetails.user.hasUsedTrial === 'yes' ? 'Sì' : 'No'}</p>
                    {userDetails.profile && (
                      <>
                        <p><strong>Età:</strong> {userDetails.profile.age} anni</p>
                        <p><strong>Peso:</strong> {userDetails.profile.weight} kg</p>
                        <p><strong>Altezza:</strong> {userDetails.profile.height} cm</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistiche Attività</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Piani alimentari:</strong> {userDetails.stats.totalMealPlans}</p>
                    <p><strong>Ricette generate:</strong> {userDetails.stats.totalRecipes}</p>
                    <p><strong>Conversazioni:</strong> {userDetails.stats.totalConversations}</p>
                    <p><strong>Azioni registrate:</strong> {userDetails.stats.totalActivities}</p>
                  </CardContent>
                </Card>

                {/* Piani Alimentari Generati */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>📋 Piani Alimentari Generati ({userDetails.mealPlans?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {userDetails.mealPlans && userDetails.mealPlans.length > 0 ? (
                        userDetails.mealPlans.map((plan: any) => (
                          <div key={plan.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-green-800">{plan.title || "Piano Personalizzato"}</h4>
                                <p className="text-sm text-green-600 mt-1">
                                  🎯 Calorie: {plan.targetCalories} | ⚖️ Peso attuale: {plan.currentWeight}kg → {plan.targetWeight}kg
                                </p>
                                <p className="text-xs text-slate-500">📅 Creato: {new Date(plan.createdAt).toLocaleDateString('it-IT')}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedItems(prev => ({
                                  ...prev,
                                  [`plan-${plan.id}`]: !prev[`plan-${plan.id}`]
                                }))}
                                className="text-green-700"
                              >
                                {expandedItems[`plan-${plan.id}`] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                Dettagli
                              </Button>
                            </div>
                            
                            {expandedItems[`plan-${plan.id}`] && (
                              <div className="mt-3 p-3 bg-white rounded border border-green-100 space-y-3">
                                <div>
                                  <h5 className="font-medium text-green-800 mb-2">📝 Descrizione:</h5>
                                  <p className="text-sm text-slate-700">{plan.description}</p>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-green-800 mb-2">🎯 Obiettivi Nutrizionali:</h5>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p>🔥 Calorie: {plan.targetCalories}</p>
                                    <p>🥩 Proteine: {plan.targetProtein}g</p>
                                    <p>🍞 Carboidrati: {plan.targetCarbs}g</p>
                                    <p>🥑 Grassi: {plan.targetFat}g</p>
                                  </div>
                                </div>

                                {plan.days && plan.days.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-green-800 mb-2">📅 Esempio Giornata (Giorno 1):</h5>
                                    <div className="space-y-2 text-xs">
                                      {plan.days[0].meals.breakfast && (
                                        <p><strong>🌅 Colazione:</strong> {plan.days[0].meals.breakfast.name}</p>
                                      )}
                                      {plan.days[0].meals.lunch && (
                                        <p><strong>🌞 Pranzo:</strong> {plan.days[0].meals.lunch.name}</p>
                                      )}
                                      {plan.days[0].meals.dinner && (
                                        <p><strong>🌙 Cena:</strong> {plan.days[0].meals.dinner.name}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-4">Nessun piano alimentare generato</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Ricette Generate */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>🍳 Ricette Generate ({userDetails.recipes?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {userDetails.recipes && userDetails.recipes.length > 0 ? (
                        userDetails.recipes.map((recipe: any) => (
                          <div key={recipe.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-orange-800">{recipe.title || recipe.name || "Ricetta Senza Titolo"}</h4>
                                <p className="text-sm text-orange-600 mt-1">
                                  🔥 {recipe.calories || "N/A"} cal | ⏱️ {recipe.prepTime || "N/A"}min prep + {recipe.cookTime || "N/A"}min cottura
                                </p>
                                <p className="text-xs text-slate-500">📅 Creata: {new Date(recipe.createdAt).toLocaleDateString('it-IT')}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedItems(prev => ({
                                  ...prev,
                                  [`recipe-${recipe.id}`]: !prev[`recipe-${recipe.id}`]
                                }))}
                                className="text-orange-700"
                              >
                                {expandedItems[`recipe-${recipe.id}`] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                Dettagli
                              </Button>
                            </div>
                            
                            {expandedItems[`recipe-${recipe.id}`] && (
                              <div className="mt-3 p-3 bg-white rounded border border-orange-100 space-y-3">
                                <div>
                                  <h5 className="font-medium text-orange-800 mb-2">📝 Descrizione:</h5>
                                  <p className="text-sm text-slate-700">{recipe.description || "Nessuna descrizione disponibile"}</p>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-orange-800 mb-2">🥗 Ingredienti:</h5>
                                  <div className="space-y-1 text-sm">
                                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                      recipe.ingredients.map((ingredient: string, index: number) => (
                                        <p key={index} className="text-slate-700">• {ingredient}</p>
                                      ))
                                    ) : (
                                      <p className="text-slate-500">Nessun ingrediente specificato</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-medium text-orange-800 mb-2">👩‍🍳 Istruzioni:</h5>
                                  <div className="space-y-1 text-sm">
                                    {recipe.instructions && recipe.instructions.length > 0 ? (
                                      recipe.instructions.map((step: string, index: number) => (
                                        <p key={index} className="text-slate-700">{index + 1}. {step}</p>
                                      ))
                                    ) : (
                                      <p className="text-slate-500">Nessuna istruzione specificata</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-medium text-orange-800 mb-2">📊 Valori Nutrizionali:</h5>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p>🔥 Calorie: {recipe.calories || "N/A"}</p>
                                    <p>🥩 Proteine: {recipe.protein || "N/A"}g</p>
                                    <p>🍞 Carboidrati: {recipe.carbs || "N/A"}g</p>
                                    <p>🥑 Grassi: {recipe.fat || "N/A"}g</p>
                                  </div>
                                  {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-orange-600">
                                        🏷️ Tag: {recipe.dietaryTags.join(", ")}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="text-xs text-slate-500 pt-2 border-t border-orange-200">
                                  <p>👨‍👩‍👧‍👦 Porzioni: {recipe.servings || 1} | 
                                     🌟 Difficoltà: {recipe.difficulty || "N/A"} | 
                                     🍝 Cucina: {recipe.cuisine || "Non specificata"}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-4">Nessuna ricetta generata</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Conversazioni Chat */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>💬 Conversazioni con Laura ({userDetails.conversations?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {userDetails.conversations && userDetails.conversations.length > 0 ? (
                        userDetails.conversations.map((conversation: any) => (
                          <div key={conversation.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-blue-800">
                                💬 Conversazione del {new Date(conversation.createdAt).toLocaleDateString('it-IT')}
                              </h4>
                              <span className="text-xs text-blue-600">{conversation.messages?.length || 0} messaggi</span>
                            </div>
                            
                            {conversation.messages && conversation.messages.length > 0 && (
                              <div className="space-y-2">
                                {conversation.messages.slice(-3).map((message: any, index: number) => (
                                  <div key={message.id || index} className={`p-2 rounded text-xs ${
                                    message.role === 'user' 
                                      ? 'bg-blue-100 text-blue-800 ml-4' 
                                      : 'bg-white text-slate-700 mr-4'
                                  }`}>
                                    <div className="flex justify-between items-start">
                                      <p className="flex-1">
                                        <strong>{message.role === 'user' ? '👤 Cliente:' : '🧠 Laura:'}</strong> 
                                        {message.content.length > 150 
                                          ? ` ${message.content.substring(0, 150)}...` 
                                          : ` ${message.content}`
                                        }
                                      </p>
                                      <span className="text-xs text-slate-400 ml-2">
                                        {new Date(message.createdAt).toLocaleTimeString('it-IT', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {conversation.messages.length > 3 && (
                                  <p className="text-xs text-blue-600 text-center">
                                    ... e altri {conversation.messages.length - 3} messaggi
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-4">Nessuna conversazione registrata</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Log Attività Recenti */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>📝 Log Attività Recenti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userDetails.activityLogs.map((log: ActivityLog) => (
                        <div key={log.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span className="text-sm">{log.action}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleString('it-IT')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attività Recente del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-sm text-slate-600">User: {activity.userId.slice(0, 8)}...</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(activity.createdAt).toLocaleString('it-IT')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
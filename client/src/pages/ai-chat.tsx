import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Heart, AlertTriangle, Loader2 } from "lucide-react";
import lauraProfileImage from "@assets/0ADDBA68-68CF-4572-8888-BB7E018FE99E_1_105_c_1756389814359.jpeg";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// Check if error is unauthorized
const isUnauthorizedError = (error: Error): boolean => {
  return /^401: .*Unauthorized/.test(error.message);
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  containsHealthWarning?: boolean;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export default function AIChat() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Accesso Richiesto",
        description: "Effettua il login per accedere alla tua consulente nutrizionale personale.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch user profile and meal plans for context
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user-profiles/current"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 2, // 2 minuti di cache
  });

  const { data: mealPlans } = useQuery({
    queryKey: ["/api/meal-plans/user"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minuti di cache
  });

  const { data: recipes } = useQuery({
    queryKey: ["/api/recipes/user"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minuti di cache
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("/api/ai-chat/message", {
        message,
        userProfile,
        mealPlans,
        recipes
      }, "POST");
    },
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        containsHealthWarning: response.containsHealthWarning || false
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessione Scaduta",
          description: "La tua sessione è scaduta. Effettua nuovamente il login.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio. Riprova tra poco.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    sendMessageMutation.mutate(inputMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-pink-500/30">
            <img 
              src={lauraProfileImage} 
              alt="Laura - Consulente Nutrizionale" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Laura - Consulente Nutrizionale Gazzella
            </h1>
            <p className="text-muted-foreground">
              La tua consulente nutrizionale personale del Manuale della Gazzella
            </p>
          </div>
        </div>

        {/* User Context Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Il Tuo Profilo Gazzella
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Dati Personali</p>
                {userProfile ? (
                  <div className="mt-1">
                    <p>Peso: {(userProfile as any).weight}kg</p>
                    <p>Altezza: {(userProfile as any).height}cm</p>
                    <p>Età: {(userProfile as any).age} anni</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-1">Profilo non completato</p>
                )}
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Piani Nutrizionali</p>
                <p className="mt-1">{(mealPlans as any)?.length || 0} piani salvati</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Ricette Personali</p>
                <p className="mt-1">{(recipes as any)?.length || 0} ricette generate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Importante: Disclaimer Medico
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Questa consulente fornisce informazioni nutrizionali basate sul Manuale della Gazzella. 
                  Non sostituisce il parere medico professionale. Per problemi di salute gravi o condizioni 
                  mediche specifiche, consulta sempre un medico di persona.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Chat con Laura</CardTitle>
          <Separator />
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-xl ring-4 ring-pink-500/20">
                    <img 
                      src={lauraProfileImage} 
                      alt="Laura - Consulente Nutrizionale" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Ciao! Sono Laura, la tua Consulente Nutrizionale</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Sono qui per aiutarti con domande sul Manuale della Gazzella, i tuoi piani nutrizionali, 
                    ricette e tutto ciò che riguarda il tuo percorso di benessere.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    <Badge variant="secondary" className="text-xs">Domande sui pasti</Badge>
                    <Badge variant="secondary" className="text-xs">Consigli nutrizionali</Badge>
                    <Badge variant="secondary" className="text-xs">Spiegazioni ricette</Badge>
                    <Badge variant="secondary" className="text-xs">Modifiche al piano</Badge>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ${
                    message.role === "user" 
                      ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center"
                      : "shadow-md ring-1 ring-pink-500/30"
                  }`}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <img 
                        src={lauraProfileImage} 
                        alt="Laura" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                        : "bg-muted"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.containsHealthWarning && (
                        <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/20 rounded text-orange-800 dark:text-orange-200 text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Consultare un medico per problemi di salute gravi
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString("it-IT", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-md ring-1 ring-pink-500/30">
                    <img 
                      src={lauraProfileImage} 
                      alt="Laura" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrivi la tua domanda sul Manuale della Gazzella..."
                disabled={sendMessageMutation.isPending}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                size="icon"
                className="bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
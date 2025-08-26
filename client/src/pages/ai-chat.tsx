import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Heart, AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome-1",
      role: "assistant",
      content: "👋 Ciao! Sono il tuo consulente nutrizionale AI specializzato nel protocollo Gazzella. Posso aiutarti con:\n\n• Domande sulla nutrizione Gazzella\n• Consigli sui piani alimentari\n• Informazioni sui cibi permessi e vietati\n• Suggerimenti per il tuo percorso nutrizionale\n\n⚠️ **Importante**: I miei consigli sono solo educativi e non sostituiscono il parere di un medico professionale.\n\nCome posso aiutarti oggi?",
      timestamp: new Date(),
      containsHealthWarning: true
    };

    setMessages([welcomeMessage]);
  }, []);

  // Chat mutation for sending messages
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log("🤖 Sending chat message:", message);
      
      return apiRequest("/api/ai-chat", {
        message,
        context: "gazzella_nutrition" 
      }, "POST");
    },
    onSuccess: (response) => {
      console.log("✅ AI response received:", response);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        containsHealthWarning: response.message.toLowerCase().includes("medico") || 
                                 response.message.toLowerCase().includes("professionale") ||
                                 response.message.toLowerCase().includes("consulta")
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: (error: any) => {
      console.error("❌ Chat error:", error);
      setIsTyping(false);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant", 
        content: "Mi dispiace, c'è stato un problema nel processare la tua richiesta. Per favore riprova. Se il problema persiste, contatta il supporto.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Errore di Connessione",
        description: "Non riesco a elaborare la tua richiesta al momento. Riprova fra qualche istante.",
        variant: "destructive",
      });
    }
  });

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and show typing
    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setIsTyping(true);

    // Send to AI
    chatMutation.mutate(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-emerald-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl h-[calc(100vh-8rem)]">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-2">
            Consulente Nutrizionale AI
          </h1>
          <p className="text-lg text-slate-600">
            Il tuo assistente specializzato nel protocollo Gazzella
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="glass-morphism h-[calc(100vh-16rem)] flex flex-col">
          
          {/* Messages Area */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-red-500 to-green-600 text-white ml-12"
                          : "bg-white shadow-sm border border-slate-200 mr-12"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.role === "assistant" && (
                          <Bot className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        {message.role === "user" && (
                          <User className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div 
                            className={`text-sm leading-relaxed whitespace-pre-wrap ${
                              message.role === "user" ? "text-white" : "text-slate-700"
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.containsHealthWarning && (
                            <div className="flex items-center mt-2 pt-2 border-t border-orange-200">
                              <Heart className="h-3 w-3 text-orange-500 mr-1" />
                              <span className="text-xs text-orange-600">Consiglio educativo</span>
                            </div>
                          )}
                          <div className={`text-xs mt-1 ${
                            message.role === "user" ? "text-green-100" : "text-slate-400"
                          }`}>
                            {message.timestamp.toLocaleTimeString("it-IT", { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-3 mr-12">
                      <div className="flex items-center space-x-3">
                        <Bot className="h-5 w-5 text-green-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                        </div>
                        <span className="text-sm text-slate-500">Il consulente sta scrivendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <Separator />
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrivi la tua domanda sulla nutrizione Gazzella..."
                disabled={isTyping}
                className="flex-1 border-slate-200 focus:border-green-500 focus:ring-green-500"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-red-500 to-green-600 hover:from-red-600 hover:to-green-700 text-white px-6"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Disclaimer */}
            <div className="flex items-center mt-3 px-1">
              <AlertTriangle className="h-3 w-3 text-orange-500 mr-1 flex-shrink-0" />
              <span className="text-xs text-slate-500">
                I consigli forniti sono solo educativi. Per problemi di salute, consulta sempre un medico.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
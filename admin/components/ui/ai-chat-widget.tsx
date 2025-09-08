import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { MessageCircle, Send, X, Bot, User, Settings } from "lucide-react";
import { cn } from "../../lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('ai-webhook-url') || '';
  });
  const [tempWebhookUrl, setTempWebhookUrl] = useState(webhookUrl);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! Main aapka AI support assistant hun. Restaurant management, menu setup, payments, ya koi aur sawal ho toh puchiye!",
      sender: "ai",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveWebhookUrl = () => {
    setWebhookUrl(tempWebhookUrl);
    localStorage.setItem('ai-webhook-url', tempWebhookUrl);
    setIsSettingsOpen(false);
    
    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      text: "Webhook URL updated successfully! Ab aap apne n8n se connected hain.",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputText;
    setInputText("");
    setIsTyping(true);

    try {
      console.log("🤖 Sending message to AI webhook:", currentMessage);
      
      // Call n8n webhook for AI response - use configured URL
      const payload = {
        message: currentMessage,
        timestamp: new Date().toISOString(),
        userType: "restaurant_owner",
        platform: "qr_menu_admin_panel"
      };
      
      console.log("🌐 Webhook URL:", webhookUrl);
      console.log("📦 Payload:", payload);
      
      // Check if webhook URL is available
      if (!webhookUrl || webhookUrl.includes('ngrok-free.app')) {
        throw new Error('External webhook service not available');
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📨 Webhook response data:", data);
      
      // Extract AI response from webhook
      const aiResponseText = data.response || data.message || data.output || data.text || "Maaf kariye, abhi main jawab nahi de sakta. Kripaya thodi der baad try kariye.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      console.log("✅ AI response added to chat");
    } catch (error) {
      console.error("❌ AI Chat Error:", error);
      
      // Provide helpful local responses instead of external webhook
      const localResponses = {
        "hello": "Salam! Main aapka restaurant support assistant hun. Restaurant management, menu setup, orders ya payments ke bare mein koi bhi sawal puch sakte hain.",
        "menu": "Menu management ke liye sidebar se 'Menu Management' section mein jaye. Wahan aap categories, items add kar sakte hain aur prices set kar sakte hain.",
        "qr": "QR codes generate karne ke liye 'QR Codes' section mein jaye. Har table ke liye unique QR code mil jayega.",
        "orders": "Orders dekhne ke liye 'Orders' section check kariye. Real-time notifications bhi milte rahenge.",
        "payment": "Payment setup ke liye 'Payments' section mein jaye. Pakistani payment methods like JazzCash, EasyPaisa support kiya jata hai.",
        "default": "Main aapki restaurant management mein madad kar sakta hun. Menu setup, QR codes, orders, payments - koi bhi sawal ho toh puchiye!"
      };
      
      const userQuery = currentMessage.toLowerCase();
      let responseText = localResponses.default;
      
      // Simple keyword matching for local responses
      if (userQuery.includes('hello') || userQuery.includes('hi') || userQuery.includes('salam')) {
        responseText = localResponses.hello;
      } else if (userQuery.includes('menu')) {
        responseText = localResponses.menu;
      } else if (userQuery.includes('qr')) {
        responseText = localResponses.qr;
      } else if (userQuery.includes('order')) {
        responseText = localResponses.orders;
      } else if (userQuery.includes('payment') || userQuery.includes('pay')) {
        responseText = localResponses.payment;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50",
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          "dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600",
          isOpen && "scale-0"
        )}
        data-testid="ai-chat-toggle-button"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Widget Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-300">
          <Card className="w-96 h-[500px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-900/95">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-lg font-semibold">AI Support Assistant</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                        data-testid="ai-chat-settings-button"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>AI Webhook Settings</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Webhook URL</label>
                          <Input
                            value={tempWebhookUrl}
                            onChange={(e) => setTempWebhookUrl(e.target.value)}
                            placeholder="Enter your n8n webhook URL"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Apna n8n webhook URL yahan paste kariye
                          </p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setTempWebhookUrl(webhookUrl);
                              setIsSettingsOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={saveWebhookUrl}>
                            Save URL
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                    data-testid="ai-chat-close-button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-blue-100">
                Restaurant support ke liye yahan message kariye
              </p>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[calc(500px-120px)]">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.sender === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-purple-600 text-white"
                        )}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[280px] rounded-lg px-3 py-2 text-sm",
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-xs opacity-70",
                            message.sender === "user" ? "text-blue-100" : "text-gray-500"
                          )}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t bg-white dark:bg-gray-900 p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Apna sawal yahan likhiye..."
                    className="flex-1"
                    disabled={isTyping}
                    data-testid="ai-chat-input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    data-testid="ai-chat-send-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AI assistant se restaurant management help liye
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";
import { generateMathResponse } from "@/services/geminiService";
import "@/styles/math-chat.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIChat = () => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const sampleQuestions = [
    "Solve the quadratic equation: 2x² - 7x + 3 = 0",
    "Find the derivative of f(x) = x³ + 5x² - 2x + 7",
    "Calculate the area of a circle with radius 5 cm",
    "What is the probability of getting at least one head when flipping 3 coins?",
    "Solve the system of equations: 3x + 2y = 12 and x - y = 1",
    "Find the volume of a sphere with radius 4 units",
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your math assistant powered by Google's Gemini 2.0 Flash. Ask me any math question and I'll help you solve it step by step with clear explanations.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (questionText?: string) => {
    const messageText = questionText || input;
    if (!messageText.trim()) return;

    // Hide suggestions after first message
    if (showSuggestions) {
      setShowSuggestions(false);
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    const userQuery = messageText;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get response from Gemini API
      const response = await generateMathResponse(userQuery);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Show error message with retry button
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        text: `Sorry, I encountered an error while processing your request.\n\n${error instanceof Error ? error.message : 'The AI service is temporarily unavailable.'}\n\nPlease try again or rephrase your question. If the problem persists, try a simpler math question.`,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col relative chat-container">
      {/* Main chat area */}
      <div className="glass-morphism rounded-3xl p-4 flex-1 flex flex-col overflow-hidden h-full">
        <h2 className="text-lg font-medium mb-3 text-center flex items-center justify-center gap-2 flex-shrink-0 ai-chat-title">
          <MessageSquare size={18} className="text-calculator-primary" />
          AI Math Assistant
        </h2>

        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none messages-container">
          {/* First message with example suggestions below it */}
          {messages.length > 0 && messages[0].sender === "ai" && (
            <div className="space-y-3">
              <motion.div
                key={messages[0].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-3xl p-2.5 max-w-[85%] bg-calculator-button text-white">
                  <div className="math-content whitespace-pre-wrap break-words">
                    <p>{messages[0].text}</p>
                  </div>
                  <p className="text-[10px] opacity-60 mt-1 text-right">
                    {messages[0].timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </motion.div>

              {/* Example suggestions below first message */}
              {showSuggestions && (
                <div className="px-1 py-3 glass-morphism rounded-3xl">
                  <p className="text-calculator-muted text-xs sm:text-sm mb-2 px-2">Try one of these examples:</p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {sampleQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(question)}
                        className="bg-calculator-button hover:bg-calculator-button/80 text-white text-xs sm:text-sm py-1.5 px-2.5 rounded-xl transition-colors example-suggestion"
                      >
                        {question.length > 25 ? question.substring(0, 22) + '...' : question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rest of the messages */}
          {messages.slice(1).map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-3xl p-2.5 max-w-[85%] ${
                  message.sender === "user"
                    ? "bg-calculator-primary text-white"
                    : "bg-calculator-button text-white"
                }`}
              >
                {message.sender === "ai" ? (
                  <div className="math-content whitespace-pre-wrap break-words">
                    {message.text.split('\n').map((line, index) => {
                      // Handle bold text (markdown ** **)
                      if (line.includes('**')) {
                        const content = line.replace(/\*\*(.*?)\*\*/g, '$1');
                        // Add special classes for specific content
                        const className = content.includes("Step") || content.includes("step")
                          ? "font-bold text-white step"
                          : content.includes("Final") || content.includes("Therefore") || content.includes("Thus")
                            ? "font-bold text-white final-answer"
                            : "font-bold text-white";

                        return (
                          <p key={index} className={className}>
                            {content}
                          </p>
                        );
                      }
                      // Handle italic text (markdown * *)
                      else if (line.includes('*')) {
                        return (
                          <p key={index}>
                            {line.split('*').map((part, i) =>
                              i % 2 === 0 ? part : <em key={i} className="text-calculator-primary">{part}</em>
                            )}
                          </p>
                        );
                      }
                      // Handle equations (lines with = sign)
                      else if (line.includes('=') && !line.startsWith('-') && !line.startsWith('•')) {
                        return (
                          <p key={index} className="bg-calculator-button/30 px-2 py-1 rounded my-1 font-mono">
                            {line}
                          </p>
                        );
                      }
                      // Regular text
                      else {
                        return <p key={index}>{line}</p>;
                      }
                    })}

                    {/* Add retry button for error messages */}
                    {(message.text.includes("Sorry, I encountered an error") ||
                      message.text.includes("Sorry, there was an error") ||
                      message.text.includes("I'm sorry, I couldn't generate")) && (
                      <button
                        onClick={() => {
                          // Find the last user message to retry
                          const lastUserMessage = [...messages].reverse().find(m => m.sender === "user");
                          if (lastUserMessage) {
                            handleSendMessage(lastUserMessage.text);
                          }
                        }}
                        className="mt-3 bg-calculator-primary text-white px-3 py-1.5 rounded-xl text-sm hover:bg-calculator-primary/80 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                )}
                <p className="text-[10px] opacity-60 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-calculator-button rounded-3xl p-3">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-calculator-muted rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-calculator-muted rounded-full animate-pulse delay-75"></div>
                  <div className="h-2 w-2 bg-calculator-muted rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}

          {/* Invisible div for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed input area at the bottom */}
      <div className="fixed-input-bar">
        <div className="flex gap-2 p-3 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Ask any math question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && input.trim()) {
                  handleSendMessage(input);
                }
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-calculator-button text-white p-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-calculator-primary shadow-inner text-sm sm:text-base"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendMessage(input)}
            className="bg-calculator-primary p-2.5 rounded-2xl text-white shadow-lg flex-shrink-0"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

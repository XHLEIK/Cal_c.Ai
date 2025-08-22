
import AIChat from "@/components/chat/AIChat";
import NavigationBar from "@/components/layout/NavigationBar";

const ChatPage = () => {
  return (
    <div className="min-h-screen pt-4 pb-16">
      <div className="container px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-calculator-text mb-3 sm:mb-4">
          AI Math Assistant
        </h1>
        <div className="h-[calc(100vh-120px)]">
          <AIChat />
        </div>
      </div>
      <NavigationBar activeTab="chat" />
    </div>
  );
};

export default ChatPage;

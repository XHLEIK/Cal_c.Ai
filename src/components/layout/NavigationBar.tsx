import { Link } from "react-router-dom";
import { Calculator, MessageSquare, Pencil, User, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
}

const NavigationItem = ({ icon, label, to, active, onClick }: NavigationItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all",
      active
        ? "text-calculator-primary nav-item-active"
        : "text-calculator-muted hover:text-calculator-text"
    )}
  >
    <div className={cn("text-lg mb-1", active && "nav-icon-glow")}>{icon}</div>
    <span className="text-[10px]">{label}</span>
  </Link>
);

interface NavigationBarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const NavigationBar = ({ activeTab, onTabChange }: NavigationBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#141824] border-t border-white/10 glass-morphism safe-bottom">
      <div className="flex justify-around items-center px-1 py-1">
        <NavigationItem
          icon={<Calculator size={20} />}
          label="Home"
          to="/"
          active={activeTab === 'home'}
          onClick={() => onTabChange && onTabChange('home')}
        />
        <NavigationItem
          icon={<Repeat size={20} />}
          label="Converter"
          to="/converter"
          active={activeTab === 'converter'}
          onClick={() => onTabChange && onTabChange('converter')}
        />
        <NavigationItem
          icon={<MessageSquare size={20} />}
          label="Chat"
          to="/chat"
          active={activeTab === 'chat'}
          onClick={() => onTabChange && onTabChange('chat')}
        />
        <NavigationItem
          icon={<Pencil size={20} />}
          label="Board"
          to="/board"
          active={activeTab === 'board'}
          onClick={() => onTabChange && onTabChange('board')}
        />
        <NavigationItem
          icon={<User size={20} />}
          label="Profile"
          to="/profile"
          active={activeTab === 'profile'}
          onClick={() => onTabChange && onTabChange('profile')}
        />
      </div>
    </div>
  );
};

export default NavigationBar;

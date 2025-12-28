"use client";
import React from "react";
import { 
  Plus, 
  MessageSquare, 
  FolderOpen, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Brain,
  History,
  LayoutDashboard,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import useConversationStore from "@/stores/useConversationStore";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ToolsPanel from "./tools-panel";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { resetConversation, chatMessages } = useConversationStore();

  // Get the first user message to show in history
  const firstUserMessage = chatMessages.find(m => m.type === "message" && m.role === "user");
  const historyLabel = firstUserMessage?.content[0]?.text?.slice(0, 30) + (firstUserMessage?.content[0]?.text?.length > 30 ? "..." : "") || "New Conversation";

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-[60px]" : "w-[260px]"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center z-50 hover:bg-muted transition-colors shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / New Chat */}
      <div className="p-3 flex flex-col gap-2">
        <div className={cn(
          "flex items-center gap-3 px-2 mb-4 transition-opacity duration-200",
          isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
        )}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Brain size={18} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">GenTel™</span>
        </div>

        <Button 
          onClick={resetConversation}
          variant="outline" 
          className={cn(
            "justify-start gap-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all",
            isCollapsed ? "px-0 justify-center w-10 h-10" : "w-full"
          )}
        >
          <Plus size={18} />
          {!isCollapsed && <span>New Session</span>}
        </Button>
      </div>

      {/* Navigation / History */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Memory Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Persistent Memory
            </h3>
          )}
          <div className={cn("px-2", isCollapsed ? "hidden" : "block")}>
            <MemoryView />
          </div>
          {isCollapsed && (
            <SidebarItem 
              icon={<Brain size={18} />} 
              label="Memory" 
              collapsed={isCollapsed} 
            />
          )}
        </div>

        {/* Projects Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Active Projects
            </h3>
          )}
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Main Workspace" 
            active 
            collapsed={isCollapsed} 
          />
          <SidebarItem 
            icon={<FolderOpen size={18} />} 
            label="Knowledge Base" 
            collapsed={isCollapsed} 
          />
        </div>

        {/* History Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Recent History
            </h3>
          )}
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label={historyLabel} 
            active={chatMessages.length > 0}
            collapsed={isCollapsed} 
          />
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="Previous Conversation" 
            collapsed={isCollapsed} 
          />
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="Project Discussion" 
            collapsed={isCollapsed} 
          />
        </div>
      </div>

      {/* Footer / Settings */}
      <div className="p-3 border-t border-border space-y-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "justify-start gap-2 w-full text-muted-foreground hover:text-foreground",
                isCollapsed ? "px-0 justify-center" : ""
              )}
            >
              <Settings size={18} />
              {!isCollapsed && <span>Settings & Tools</span>}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent">
            <div className="bg-card rounded-xl overflow-hidden border border-border shadow-2xl">
              <DialogHeader className="p-6 border-b border-border bg-muted/30">
                <DialogTitle className="flex items-center gap-2">
                  <Settings size={20} className="text-primary" />
                  Settings & Autonomous Capabilities
                </DialogTitle>
              </DialogHeader>
              <div className="p-0">
                <ToolsPanel />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active = false, 
  collapsed = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-3 w-full px-2 py-2 rounded-lg transition-all group",
        active 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed ? "justify-center" : ""
      )}
      title={collapsed ? label : undefined}
    >
      <div className={cn(
        "shrink-0 transition-transform duration-200 group-hover:scale-110",
        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )}>
        {icon}
      </div>
      {!collapsed && (
        <span className="truncate text-sm">{label}</span>
      )}
    </button>
  );
}

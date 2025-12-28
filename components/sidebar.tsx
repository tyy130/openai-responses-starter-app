"use client";
import React from "react";
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Brain,
  MoreVertical,
  Edit2,
  Trash2
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";
import ToolsPanel from "./tools-panel";

export default function Sidebar({ hideToggle = false }: { hideToggle?: boolean }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { 
    resetConversation, 
    sessions, 
    currentSessionId, 
    loadSessions, 
    switchSession,
    deleteSession,
    renameSession
  } = useConversationStore();

  React.useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-[60px]" : "w-[260px]"
      )}
    >
      {/* Toggle Button */}
      {!hideToggle && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center z-50 hover:bg-muted transition-colors shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

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
        {/* History Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Conversations
            </h3>
          )}
          
          {sessions.map((session) => (
            <SidebarItem 
              key={session.id}
              icon={<MessageSquare size={18} />} 
              label={session.title} 
              active={currentSessionId === session.id}
              collapsed={isCollapsed}
              onClick={() => switchSession(session.id)}
              onDelete={() => deleteSession(session.id)}
              onRename={(newTitle) => renameSession(session.id, newTitle)}
            />
          ))}

          {sessions.length === 0 && !isCollapsed && (
            <div className="px-2 py-4 text-center">
              <p className="text-xs text-muted-foreground">No conversations yet.</p>
            </div>
          )}
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
  collapsed = false,
  onClick,
  onDelete,
  onRename
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(label);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue.trim() && editValue !== label) {
      onRename?.(editValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 w-full px-2 py-2 rounded-lg transition-all",
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
          <div className="flex-1 text-left truncate">
            {isEditing ? (
              <form onSubmit={handleRename} className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setEditValue(label);
                    }
                  }}
                  className="h-6 py-0 px-1 text-sm bg-background border-primary"
                />
              </form>
            ) : (
              <span className="text-sm">{label}</span>
            )}
          </div>
        )}
      </button>

      {!collapsed && !isEditing && (
        <div 
          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background/50">
                <MoreVertical size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-1" align="end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setEditValue(label);
                }}
              >
                <Edit2 size={12} />
                Rename
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-2 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Trash2 size={12} />
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

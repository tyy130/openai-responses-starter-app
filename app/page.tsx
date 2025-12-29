"use client";
import dynamic from "next/dynamic";
import { RotateCcw, Brain, Menu } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useConversationStore from "@/stores/useConversationStore";
import useToolsStore from "@/stores/useToolsStore";
import useAgentFlowStore from "@/stores/useAgentFlowStore";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const Assistant = dynamic(() => import("@/components/assistant"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background animate-pulse" />,
});

const Sidebar = dynamic(() => import("@/components/sidebar"), {
  ssr: false,
  loading: () => <div className="h-full w-[260px] bg-card animate-pulse" />,
});

const AgentFlowDashboard = dynamic(() => import("@/components/agent-flow"), {
  ssr: false,
  loading: () => <div className="h-[280px] bg-card border-t border-border animate-pulse" />,
});

export default function Main() {
  const router = useRouter();
  const { resetConversation, currentSessionId, chatMessages, switchSession, _hasHydrated } = useConversationStore();
  const { setGoogleIntegrationEnabled, setGithubEnabled } = useToolsStore();
  const { resetPipeline, resetMetrics } = useAgentFlowStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reset agent flow when conversation resets
  const handleResetConversation = useCallback(() => {
    resetConversation();
    resetPipeline();
    resetMetrics();
  }, [resetConversation, resetPipeline, resetMetrics]);

  // Restore session on refresh
  useEffect(() => {
    if (_hasHydrated && currentSessionId && chatMessages.length === 0) {
      switchSession(currentSessionId);
    }
  }, [_hasHydrated, currentSessionId, chatMessages.length, switchSession]);

  // After OAuth redirect, reinitialize the conversation so the next turn
  // uses the connector-enabled server configuration immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const isConnected = params.get("connected");
    const isGithubConnected = params.get("github_connected");
    
    if (isConnected === "1") {
      setGoogleIntegrationEnabled(true);
      handleResetConversation();
      router.replace("/", { scroll: false });
    } else if (isGithubConnected === "1") {
      setGithubEnabled(true);
      handleResetConversation();
      router.replace("/", { scroll: false });
    }
  }, [router, handleResetConversation, setGoogleIntegrationEnabled, setGithubEnabled]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Sidebar (Desktop) */}
      <aside className="hidden md:block h-full z-20">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b border-border md:hidden bg-card/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DialogTrigger asChild>
                <button className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Menu size={20} />
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 w-[280px] h-full left-0 translate-x-0 sm:translate-x-0 border-r border-border rounded-none bg-card">
                <div className="h-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Sidebar hideToggle />
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain size={18} className="text-primary-foreground" />
              </div>
              <h1 className="font-semibold text-sm">GenTel™</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleResetConversation}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Assistant />
          </div>
          {/* Agent Flow Dashboard */}
          <AgentFlowDashboard />
        </div>
      </div>
    </div>
  );
}

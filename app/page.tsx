"use client";
import dynamic from "next/dynamic";
import { Menu, X, RotateCcw, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useConversationStore from "@/stores/useConversationStore";
import useToolsStore from "@/stores/useToolsStore";

const Assistant = dynamic(() => import("@/components/assistant"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background animate-pulse" />,
});

const Sidebar = dynamic(() => import("@/components/sidebar"), {
  ssr: false,
  loading: () => <div className="h-full w-[260px] bg-card animate-pulse" />,
});

export default function Main() {
  const router = useRouter();
  const { resetConversation } = useConversationStore();
  const { setGoogleIntegrationEnabled, setGithubEnabled } = useToolsStore();

  // After OAuth redirect, reinitialize the conversation so the next turn
  // uses the connector-enabled server configuration immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const isConnected = params.get("connected");
    const isGithubConnected = params.get("github_connected");
    
    if (isConnected === "1") {
      setGoogleIntegrationEnabled(true);
      resetConversation();
      router.replace("/", { scroll: false });
    } else if (isGithubConnected === "1") {
      setGithubEnabled(true);
      resetConversation();
      router.replace("/", { scroll: false });
    }
  }, [router, resetConversation, setGoogleIntegrationEnabled, setGithubEnabled]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Sidebar */}
      <aside className="hidden md:block h-full z-20">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b border-border md:hidden bg-card/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-sm">TacticDev GenTel™</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => resetConversation()}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Assistant />
        </div>
      </div>
    </div>
  );
}

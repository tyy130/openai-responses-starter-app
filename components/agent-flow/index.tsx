"use client";

import React from "react";
import { 
  Activity, 
  Gauge, 
  Clock, 
  FileText,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Radio,
  Layers,
  GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAgentFlowStore from "@/stores/useAgentFlowStore";
import AgentPipeline from "./agent-pipeline";
import AgentMetrics from "./agent-metrics";
import ToolTimeline from "./tool-timeline";
import AuditTrail from "./audit-trail";
import LayerHierarchy from "./layer-hierarchy";

type TabId = "flow" | "metrics" | "timeline" | "audit" | "hierarchy";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function AgentFlowDashboard() {
  const { 
    activeTab, 
    setActiveTab, 
    isPanelExpanded, 
    setPanelExpanded,
    currentStage,
    toolExecutions,
    auditLog,
    metrics
  } = useAgentFlowStore();

  const [isMinimized, setIsMinimized] = React.useState(false);

  const tabs: Tab[] = [
    { 
      id: "flow", 
      label: "Pipeline", 
      icon: <Activity size={14} /> 
    },
    {
      id: "hierarchy",
      label: "Layers",
      icon: <GitBranch size={14} />
    },
    { 
      id: "metrics", 
      label: "Metrics", 
      icon: <Gauge size={14} />,
      badge: metrics.toolCalls
    },
    { 
      id: "timeline", 
      label: "Timeline", 
      icon: <Clock size={14} />,
      badge: toolExecutions.length
    },
    { 
      id: "audit", 
      label: "Audit Log", 
      icon: <FileText size={14} />,
      badge: auditLog.filter(l => l.severity === 'error').length || undefined
    },
  ];

  const isActive = currentStage !== "idle";

  return (
    <div 
      className={cn(
        "flex flex-col bg-card/95 backdrop-blur-xl border-t border-border transition-all duration-300",
        isMinimized ? "h-10" : isPanelExpanded ? "h-[420px]" : "h-[280px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "relative flex items-center justify-center w-6 h-6 rounded-full",
              isActive ? "bg-primary/20" : "bg-muted"
            )}>
              <Layers size={12} className={cn(
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Agent Flow Control</span>
              <span className="text-[10px] text-muted-foreground">
                {isActive ? `Stage: ${currentStage}` : "Awaiting input"}
              </span>
            </div>
          </div>

          {/* Live indicator */}
          {isActive && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <Radio size={10} className="text-green-400 animate-pulse" />
              <span className="text-[10px] font-medium text-green-400">LIVE</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPanelExpanded(!isPanelExpanded)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={isPanelExpanded ? "Compact view" : "Expanded view"}
          >
            {isPanelExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={isMinimized ? "Show dashboard" : "Minimize"}
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-col gap-1 p-2 border-r border-border/50 bg-muted/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all relative",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center",
                    tab.id === "audit" && auditLog.some(l => l.severity === 'error')
                      ? "bg-red-500 text-white"
                      : "bg-primary/20 text-primary"
                  )}>
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden p-4">
            {activeTab === "flow" && <AgentPipeline />}
            {activeTab === "hierarchy" && <LayerHierarchy />}
            {activeTab === "metrics" && <AgentMetrics />}
            {activeTab === "timeline" && <ToolTimeline />}
            {activeTab === "audit" && <AuditTrail />}
          </div>
        </div>
      )}
    </div>
  );
}

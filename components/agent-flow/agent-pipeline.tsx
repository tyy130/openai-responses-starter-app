"use client";

import React from "react";
import { 
  Activity, 
  Zap, 
  Database, 
  Brain,
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAgentFlowStore, { PipelineNode, RouteType } from "@/stores/useAgentFlowStore";

const ROUTE_COLORS: Record<NonNullable<RouteType> | "none", { bg: string; border: string; text: string }> = {
  fast: { bg: "bg-green-500/20", border: "border-green-500", text: "text-green-400" },
  graph: { bg: "bg-purple-500/20", border: "border-purple-500", text: "text-purple-400" },
  complex: { bg: "bg-orange-500/20", border: "border-orange-500", text: "text-orange-400" },
  none: { bg: "bg-muted", border: "border-border", text: "text-muted-foreground" },
};

const STAGE_ICONS: Record<string, React.ReactNode> = {
  routing: <GitBranch size={14} />,
  cache_check: <Database size={14} />,
  retrieval: <Activity size={14} />,
  graph_search: <Brain size={14} />,
  hybrid_search: <Activity size={14} />,
  reranking: <Zap size={14} />,
  grading: <CheckCircle2 size={14} />,
  generation: <Brain size={14} />,
  verification: <CheckCircle2 size={14} />,
};

function PipelineNodeComponent({ node, isLast }: { node: PipelineNode; isLast: boolean }) {
  const statusStyles = {
    pending: "bg-muted border-border text-muted-foreground",
    active: "bg-primary/20 border-primary text-primary animate-pulse",
    completed: "bg-green-500/20 border-green-500 text-green-400",
    skipped: "bg-muted border-border text-muted-foreground opacity-50",
    error: "bg-red-500/20 border-red-500 text-red-400",
  };

  const StatusIcon = () => {
    switch (node.status) {
      case "completed":
        return <CheckCircle2 size={10} className="text-green-400" />;
      case "error":
        return <XCircle size={10} className="text-red-400" />;
      case "active":
        return <Clock size={10} className="text-primary animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      <div 
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-all",
          statusStyles[node.status]
        )}
      >
        {STAGE_ICONS[node.stage] || <Activity size={14} />}
        <span>{node.label}</span>
        <StatusIcon />
      </div>
      {!isLast && (
        <ChevronRight size={12} className="mx-0.5 text-muted-foreground/50" />
      )}
    </div>
  );
}

export default function AgentPipeline() {
  const { currentRoute, currentStage, pipelineNodes } = useAgentFlowStore();
  const routeColor = ROUTE_COLORS[currentRoute || "none"];

  // Filter nodes based on current route
  const visibleNodes = React.useMemo(() => {
    if (!currentRoute) return pipelineNodes;
    
    // For fast path, skip graph_search
    if (currentRoute === "fast") {
      return pipelineNodes.filter(n => n.stage !== "graph_search");
    }
    return pipelineNodes;
  }, [currentRoute, pipelineNodes]);

  return (
    <div className="flex flex-col gap-2">
      {/* Route Indicator */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
          routeColor.bg,
          routeColor.border,
          routeColor.text
        )}>
          {currentRoute ? `${currentRoute} path` : "awaiting query"}
        </div>
        <div className="text-[10px] text-muted-foreground">
          Stage: <span className="font-medium text-foreground">{currentStage}</span>
        </div>
      </div>

      {/* Pipeline Flow */}
      <div className="flex items-center flex-wrap gap-y-1">
        {visibleNodes.map((node, idx) => (
          <PipelineNodeComponent 
            key={node.id} 
            node={node} 
            isLast={idx === visibleNodes.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAgentFlowStore, { ToolExecution } from "@/stores/useAgentFlowStore";

const LAYER_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  2: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  3: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
  4: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
  5: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400" },
  6: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
  7: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
};

const LAYER_NAMES: Record<number, string> = {
  1: "Orchestrator",
  2: "Specialist",
  3: "Judge",
  4: "Memory",
  5: "Auditor",
  6: "Market",
  7: "Rescue",
};

function ToolExecutionCard({ tool }: { tool: ToolExecution }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const layerStyle = LAYER_COLORS[tool.layer] || LAYER_COLORS[1];

  const StatusIcon = () => {
    switch (tool.status) {
      case "completed":
        return <CheckCircle2 size={12} className="text-green-400" />;
      case "error":
        return <XCircle size={12} className="text-red-400" />;
      case "executing":
        return <Loader2 size={12} className="text-primary animate-spin" />;
      default:
        return <Clock size={12} className="text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div 
      className={cn(
        "flex flex-col border rounded-lg overflow-hidden transition-all",
        layerStyle.bg,
        layerStyle.border,
        tool.status === "executing" && "ring-1 ring-primary/50"
      )}
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 p-2 hover:bg-white/5 transition-colors w-full text-left"
      >
        {/* Timeline dot */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-2 h-2 rounded-full",
            tool.status === "completed" ? "bg-green-400" :
            tool.status === "error" ? "bg-red-400" :
            tool.status === "executing" ? "bg-primary animate-pulse" :
            "bg-muted-foreground"
          )} />
        </div>

        {/* Tool info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Zap size={12} className={layerStyle.text} />
            <span className="text-xs font-medium truncate">{tool.name}</span>
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase",
              layerStyle.bg,
              layerStyle.text
            )}>
              L{tool.layer} {LAYER_NAMES[tool.layer]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            <span>{formatTime(tool.startTime)}</span>
            {tool.duration !== undefined && (
              <>
                <span>•</span>
                <span className="font-medium">{tool.duration}ms</span>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusIcon />
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-border/30 p-2 text-[10px] space-y-2 bg-black/20">
          {tool.input && (
            <div>
              <div className="text-muted-foreground uppercase tracking-wider font-medium mb-1">Input</div>
              <pre className="bg-black/30 rounded p-2 overflow-x-auto text-foreground/80">
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}
          {tool.output && (
            <div>
              <div className="text-muted-foreground uppercase tracking-wider font-medium mb-1">Output</div>
              <pre className="bg-black/30 rounded p-2 overflow-x-auto text-foreground/80 max-h-32 overflow-y-auto">
                {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output, null, 2)}
              </pre>
            </div>
          )}
          {tool.error && (
            <div>
              <div className="text-red-400 uppercase tracking-wider font-medium mb-1">Error</div>
              <pre className="bg-red-500/10 rounded p-2 text-red-400 overflow-x-auto">
                {tool.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ToolTimeline() {
  const { toolExecutions } = useAgentFlowStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to latest
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [toolExecutions.length]);

  if (toolExecutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock size={24} className="mb-2 opacity-50" />
        <span className="text-xs">No tool executions yet</span>
        <span className="text-[10px] mt-1">Send a message to see the agent flow</span>
      </div>
    );
  }

  // Show most recent first
  const sortedExecutions = [...toolExecutions].reverse();

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1"
    >
      {sortedExecutions.map((tool) => (
        <ToolExecutionCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

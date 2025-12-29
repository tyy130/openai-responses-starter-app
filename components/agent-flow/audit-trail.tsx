"use client";

import React from "react";
import { 
  GitBranch, 
  Zap, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Info,
  Clock,
  ChevronDown,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAgentFlowStore, { AuditLogEntry } from "@/stores/useAgentFlowStore";

const SEVERITY_STYLES: Record<AuditLogEntry["severity"], { icon: React.ReactNode; color: string; bg: string }> = {
  info: { 
    icon: <Info size={10} />, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10" 
  },
  warn: { 
    icon: <AlertTriangle size={10} />, 
    color: "text-yellow-400", 
    bg: "bg-yellow-500/10" 
  },
  error: { 
    icon: <XCircle size={10} />, 
    color: "text-red-400", 
    bg: "bg-red-500/10" 
  },
  success: { 
    icon: <CheckCircle2 size={10} />, 
    color: "text-green-400", 
    bg: "bg-green-500/10" 
  },
};

const TYPE_ICONS: Record<AuditLogEntry["type"], React.ReactNode> = {
  routing: <GitBranch size={10} />,
  tool_call: <Zap size={10} />,
  cache: <Database size={10} />,
  grading: <CheckCircle2 size={10} />,
  decision: <Info size={10} />,
  error: <XCircle size={10} />,
  rescue: <AlertTriangle size={10} />,
};

function LogEntry({ entry }: { entry: AuditLogEntry }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const severity = SEVERITY_STYLES[entry.severity];
  const hasMetadata = entry.metadata && Object.keys(entry.metadata).length > 0;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div 
      className={cn(
        "flex flex-col rounded border border-border/30 overflow-hidden",
        severity.bg
      )}
    >
      <button 
        onClick={() => hasMetadata && setIsExpanded(!isExpanded)}
        disabled={!hasMetadata}
        className={cn(
          "flex items-start gap-2 p-1.5 text-left w-full",
          hasMetadata && "hover:bg-white/5 cursor-pointer"
        )}
      >
        {/* Severity indicator */}
        <div className={cn("mt-0.5", severity.color)}>
          {severity.icon}
        </div>

        {/* Type badge */}
        <div className={cn(
          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase bg-muted/50",
          severity.color
        )}>
          {TYPE_ICONS[entry.type]}
          {entry.type.replace('_', ' ')}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-foreground/90 line-clamp-2">
            {entry.message}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground shrink-0">
          <Clock size={8} />
          {formatTime(entry.timestamp)}
        </div>

        {/* Expand indicator */}
        {hasMetadata && (
          <ChevronDown 
            size={10} 
            className={cn(
              "text-muted-foreground transition-transform shrink-0",
              isExpanded && "rotate-180"
            )} 
          />
        )}
      </button>

      {/* Metadata */}
      {isExpanded && hasMetadata && (
        <div className="border-t border-border/30 p-2 bg-black/20">
          <pre className="text-[9px] text-foreground/70 overflow-x-auto">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function AuditTrail() {
  const { auditLog, clearAuditLog } = useAgentFlowStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [filter, setFilter] = React.useState<AuditLogEntry["type"] | "all">("all");

  const filteredLogs = React.useMemo(() => {
    if (filter === "all") return auditLog;
    return auditLog.filter(log => log.type === filter);
  }, [auditLog, filter]);

  if (auditLog.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Database size={24} className="mb-2 opacity-50" />
        <span className="text-xs">No audit logs yet</span>
        <span className="text-[10px] mt-1">Activity will appear here as the agent works</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Filter bar */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <div className="flex items-center gap-1 flex-1 flex-wrap">
          {(["all", "routing", "tool_call", "cache", "grading", "error", "rescue"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-2 py-0.5 rounded text-[9px] font-medium uppercase transition-colors",
                filter === type 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button
          onClick={clearAuditLog}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Clear logs"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Log entries */}
      <div 
        ref={scrollRef}
        className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-1"
      >
        {filteredLogs.map((entry) => (
          <LogEntry key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/30 text-[9px] text-muted-foreground">
        <span>{auditLog.length} total entries</span>
        <span>•</span>
        <span>{auditLog.filter(l => l.severity === 'error').length} errors</span>
        <span>•</span>
        <span>{auditLog.filter(l => l.type === 'rescue').length} rescues</span>
      </div>
    </div>
  );
}

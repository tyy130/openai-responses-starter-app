"use client";

import React from "react";
import { 
  Brain, 
  Wrench, 
  Scale, 
  Database, 
  FileText, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAgentFlowStore from "@/stores/useAgentFlowStore";

interface LayerConfig {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const LAYERS: LayerConfig[] = [
  { 
    id: 1, 
    name: "Orchestrator", 
    description: "Routes, coordinates, manages",
    icon: <Brain size={14} />,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30"
  },
  { 
    id: 2, 
    name: "Specialists", 
    description: "Summarizer, Planner, Coder",
    icon: <Wrench size={14} />,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30"
  },
  { 
    id: 3, 
    name: "Judges", 
    description: "Verifiers, Graders",
    icon: <Scale size={14} />,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/30"
  },
  { 
    id: 4, 
    name: "Memory", 
    description: "KV Store, Semantic Cache",
    icon: <Database size={14} />,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
  },
  { 
    id: 5, 
    name: "Auditors", 
    description: "Logging, Review",
    icon: <FileText size={14} />,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/30"
  },
  { 
    id: 6, 
    name: "Market", 
    description: "Budget, Resource Allocation",
    icon: <TrendingUp size={14} />,
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
  },
  { 
    id: 7, 
    name: "Rescue", 
    description: "Error Recovery, Diagnostics",
    icon: <AlertTriangle size={14} />,
    color: "text-red-400 bg-red-500/10 border-red-500/30"
  },
];

export default function LayerHierarchy() {
  const { toolExecutions } = useAgentFlowStore();

  // Count active tools per layer
  const layerCounts = React.useMemo(() => {
    const counts: Record<number, { total: number; active: number }> = {};
    LAYERS.forEach(l => { counts[l.id] = { total: 0, active: 0 }; });
    
    toolExecutions.forEach(tool => {
      if (counts[tool.layer]) {
        counts[tool.layer].total++;
        if (tool.status === "executing") {
          counts[tool.layer].active++;
        }
      }
    });
    
    return counts;
  }, [toolExecutions]);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
        Agent Hierarchy
      </div>
      <div className="flex flex-col gap-0.5">
        {LAYERS.map((layer) => {
          const counts = layerCounts[layer.id];
          const isActive = counts.active > 0;
          const colorClasses = layer.color.split(' ');
          
          return (
            <div 
              key={layer.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded border transition-all",
                colorClasses[1], // bg
                colorClasses[2], // border
                isActive && "ring-1 ring-offset-1 ring-offset-background animate-pulse"
              )}
            >
              {/* Layer number */}
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold",
                colorClasses[0], // text
                "bg-black/20"
              )}>
                {layer.id}
              </div>
              
              {/* Icon */}
              <div className={cn(colorClasses[0])}>
                {layer.icon}
              </div>
              
              {/* Name & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium">{layer.name}</span>
                  {counts.total > 0 && (
                    <span className={cn(
                      "text-[9px] px-1 py-0.5 rounded-full",
                      colorClasses[1],
                      colorClasses[0]
                    )}>
                      {counts.total} calls
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">{layer.description}</span>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    layer.id === 7 ? "bg-red-400" : "bg-green-400"
                  )} />
                  <span className="text-[9px] font-medium">{counts.active}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

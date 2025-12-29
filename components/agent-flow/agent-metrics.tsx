"use client";

import React from "react";
import { 
  Zap, 
  Clock, 
  CheckCircle2,
  XCircle,
  RotateCcw,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAgentFlowStore from "@/stores/useAgentFlowStore";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: string;
  subValue?: string;
}

function MetricCard({ label, value, icon, color = "text-primary", subValue }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </span>
        <div className={cn("opacity-70", color)}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className={cn("text-lg font-bold tabular-nums", color)}>
          {value}
        </span>
        {subValue && (
          <span className="text-[10px] text-muted-foreground mb-0.5">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

function CircularProgress({ value, max, color = "stroke-primary" }: { value: number; max: number; color?: string }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", color)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default function AgentMetrics() {
  const { metrics, resetMetrics } = useAgentFlowStore();
  
  const successRate = metrics.toolCalls > 0 
    ? ((metrics.successfulCalls / metrics.toolCalls) * 100).toFixed(0)
    : "—";

  const avgLatency = metrics.successfulCalls > 0
    ? Math.round(metrics.totalLatencyMs / metrics.successfulCalls)
    : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <MetricCard
          label="Tool Calls"
          value={metrics.toolCalls}
          icon={<Zap size={14} />}
          color="text-primary"
        />
        <MetricCard
          label="Success"
          value={`${successRate}%`}
          icon={<CheckCircle2 size={14} />}
          color="text-green-400"
        />
        <MetricCard
          label="Avg Latency"
          value={avgLatency}
          subValue="ms"
          icon={<Clock size={14} />}
          color="text-blue-400"
        />
        <MetricCard
          label="Rescues"
          value={metrics.rescueInvocations}
          icon={<AlertTriangle size={14} />}
          color={metrics.rescueInvocations > 0 ? "text-orange-400" : "text-muted-foreground"}
        />
      </div>

      {/* Detailed Stats */}
      <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg border border-border/50">
        {/* Cache Performance */}
        <div className="flex items-center gap-3">
          <CircularProgress 
            value={metrics.cacheHits} 
            max={metrics.cacheHits + metrics.cacheMisses || 1}
            color="stroke-cyan-400"
          />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Cache Hit Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-cyan-400">{metrics.cacheHits}</span>
              <span className="text-[10px] text-muted-foreground">hits</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-muted-foreground">{metrics.cacheMisses}</span>
              <span className="text-[10px] text-muted-foreground">misses</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-border" />

        {/* Token Usage */}
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Token Usage</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" />
              <span className="text-sm font-bold">{metrics.totalTokensInput.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">in</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-blue-400 rotate-180" />
              <span className="text-sm font-bold">{metrics.totalTokensOutput.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">out</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-border" />

        {/* Success/Fail */}
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Call Status</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-green-400" />
              <span className="text-sm font-bold text-green-400">{metrics.successfulCalls}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle size={12} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">{metrics.failedCalls}</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetMetrics}
          className="ml-auto p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Reset Metrics"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}

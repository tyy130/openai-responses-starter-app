import { create } from "zustand";

export type AgentStage = 
  | "idle" 
  | "routing" 
  | "cache_check" 
  | "retrieval" 
  | "graph_search"
  | "hybrid_search"
  | "reranking" 
  | "grading" 
  | "generation" 
  | "verification"
  | "completed"
  | "error";

export type RouteType = "fast" | "graph" | "complex" | null;

export interface ToolExecution {
  id: string;
  name: string;
  status: "pending" | "executing" | "completed" | "error";
  startTime: number;
  endTime?: number;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  layer: number; // Which layer in the hierarchy (1-7)
}

export interface PipelineNode {
  id: string;
  stage: AgentStage;
  label: string;
  status: "pending" | "active" | "completed" | "skipped" | "error";
  startTime?: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

export interface FlowMetrics {
  totalTokensInput: number;
  totalTokensOutput: number;
  totalLatencyMs: number;
  cacheHits: number;
  cacheMisses: number;
  toolCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rescueInvocations: number;
  currentRoute: RouteType;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  type: "routing" | "tool_call" | "cache" | "grading" | "decision" | "error" | "rescue";
  message: string;
  metadata?: Record<string, any>;
  severity: "info" | "warn" | "error" | "success";
}

interface AgentFlowState {
  // Pipeline state
  currentStage: AgentStage;
  currentRoute: RouteType;
  pipelineNodes: PipelineNode[];
  
  // Tool executions
  toolExecutions: ToolExecution[];
  activeToolId: string | null;
  
  // Metrics
  metrics: FlowMetrics;
  
  // Audit trail
  auditLog: AuditLogEntry[];
  
  // View state
  isPanelExpanded: boolean;
  activeTab: "flow" | "hierarchy" | "metrics" | "timeline" | "audit";
  
  // Actions
  setCurrentStage: (stage: AgentStage) => void;
  setCurrentRoute: (route: RouteType) => void;
  updatePipelineNode: (id: string, updates: Partial<PipelineNode>) => void;
  resetPipeline: () => void;
  
  addToolExecution: (tool: ToolExecution) => void;
  updateToolExecution: (id: string, updates: Partial<ToolExecution>) => void;
  completeToolExecution: (id: string, output: any) => void;
  failToolExecution: (id: string, error: string) => void;
  
  updateMetrics: (updates: Partial<FlowMetrics>) => void;
  incrementMetric: (key: keyof FlowMetrics, amount?: number) => void;
  resetMetrics: () => void;
  
  addAuditLog: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  clearAuditLog: () => void;
  
  setPanelExpanded: (expanded: boolean) => void;
  setActiveTab: (tab: "flow" | "hierarchy" | "metrics" | "timeline" | "audit") => void;
}

const initialPipelineNodes: PipelineNode[] = [
  { id: "routing", stage: "routing", label: "Semantic Router", status: "pending" },
  { id: "cache", stage: "cache_check", label: "Cache Check", status: "pending" },
  { id: "retrieval", stage: "retrieval", label: "Retrieval", status: "pending" },
  { id: "rerank", stage: "reranking", label: "Reranking", status: "pending" },
  { id: "grade", stage: "grading", label: "Grading", status: "pending" },
  { id: "generate", stage: "generation", label: "Generation", status: "pending" },
  { id: "verify", stage: "verification", label: "Verification", status: "pending" },
];

const initialMetrics: FlowMetrics = {
  totalTokensInput: 0,
  totalTokensOutput: 0,
  totalLatencyMs: 0,
  cacheHits: 0,
  cacheMisses: 0,
  toolCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  rescueInvocations: 0,
  currentRoute: null,
};

const useAgentFlowStore = create<AgentFlowState>((set, get) => ({
  currentStage: "idle",
  currentRoute: null,
  pipelineNodes: [...initialPipelineNodes],
  toolExecutions: [],
  activeToolId: null,
  metrics: { ...initialMetrics },
  auditLog: [],
  isPanelExpanded: true,
  activeTab: "flow",

  setCurrentStage: (stage) => set({ currentStage: stage }),
  
  setCurrentRoute: (route) => {
    set({ currentRoute: route });
    get().updateMetrics({ currentRoute: route });
    get().addAuditLog({
      type: "routing",
      message: `Query routed to ${route?.toUpperCase() || "UNKNOWN"} path`,
      severity: "info",
      metadata: { route },
    });
  },

  updatePipelineNode: (id, updates) => {
    set((state) => ({
      pipelineNodes: state.pipelineNodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
  },

  resetPipeline: () => {
    set({
      currentStage: "idle",
      currentRoute: null,
      pipelineNodes: initialPipelineNodes.map((node) => ({
        ...node,
        status: "pending",
        startTime: undefined,
        endTime: undefined,
        metadata: undefined,
      })),
    });
  },

  addToolExecution: (tool) => {
    set((state) => ({
      toolExecutions: [...state.toolExecutions, tool],
      activeToolId: tool.id,
    }));
    get().incrementMetric("toolCalls");
    get().addAuditLog({
      type: "tool_call",
      message: `Invoking ${tool.name}`,
      severity: "info",
      metadata: { toolId: tool.id, layer: tool.layer, input: tool.input },
    });
  },

  updateToolExecution: (id, updates) => {
    set((state) => ({
      toolExecutions: state.toolExecutions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  completeToolExecution: (id, output) => {
    const now = Date.now();
    const tool = get().toolExecutions.find((t) => t.id === id);
    if (tool) {
      const duration = now - tool.startTime;
      get().updateToolExecution(id, {
        status: "completed",
        endTime: now,
        duration,
        output,
      });
      get().incrementMetric("successfulCalls");
      get().updateMetrics({
        totalLatencyMs: get().metrics.totalLatencyMs + duration,
      });
      get().addAuditLog({
        type: "tool_call",
        message: `${tool.name} completed in ${duration}ms`,
        severity: "success",
        metadata: { toolId: id, duration, output },
      });
    }
    set({ activeToolId: null });
  },

  failToolExecution: (id, error) => {
    const now = Date.now();
    const tool = get().toolExecutions.find((t) => t.id === id);
    if (tool) {
      const duration = now - tool.startTime;
      get().updateToolExecution(id, {
        status: "error",
        endTime: now,
        duration,
        error,
      });
      get().incrementMetric("failedCalls");
      get().addAuditLog({
        type: "error",
        message: `${tool.name} failed: ${error}`,
        severity: "error",
        metadata: { toolId: id, duration, error },
      });
    }
    set({ activeToolId: null });
  },

  updateMetrics: (updates) => {
    set((state) => ({
      metrics: { ...state.metrics, ...updates },
    }));
  },

  incrementMetric: (key, amount = 1) => {
    set((state) => ({
      metrics: {
        ...state.metrics,
        [key]: (state.metrics[key] as number) + amount,
      },
    }));
  },

  resetMetrics: () => set({ metrics: { ...initialMetrics } }),

  addAuditLog: (entry) => {
    set((state) => ({
      auditLog: [
        {
          ...entry,
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        },
        ...state.auditLog,
      ].slice(0, 500), // Keep last 500 entries
    }));
  },

  clearAuditLog: () => set({ auditLog: [] }),

  setPanelExpanded: (expanded) => set({ isPanelExpanded: expanded }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useAgentFlowStore;

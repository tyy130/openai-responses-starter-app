import { functionsMap } from "../../config/functions";
import useAgentFlowStore from "@/stores/useAgentFlowStore";

type ToolName = keyof typeof functionsMap;

// Map tool names to their layer in the hierarchy
const TOOL_LAYERS: Record<string, number> = {
  // Layer 1: Orchestrator (implicit, no tools)
  
  // Layer 2: Specialists
  specialist_summarizer: 2,
  specialist_planner: 2,
  specialist_qa_checker: 2,
  specialist_coder: 2,
  
  // Layer 3: Judges & Verifiers
  verify_fact: 3,
  memory_judge: 3,
  risk_scorer: 3,
  agla_grader: 3,
  
  // Layer 4: Memory/Storage
  kv_get: 4,
  kv_set: 4,
  kv_list: 4,
  kv_delete: 4,
  manage_memory: 4,
  agla_semantic_cache: 4,
  
  // Layer 5: Auditors
  audit_log_event: 5,
  
  // Layer 6: Market/Resources
  market_resource_quote: 6,
  market_budget_check: 6,
  
  // Layer 7: Rescue Team
  specialist_rescue: 7,
  
  // AGLA tools (Layer 1 - Orchestrator level)
  agla_semantic_router: 1,
  agla_graph_search: 1,
  agla_hybrid_search: 1,
  agla_rerank: 1,
  
  // Default for other tools
  default: 1,
};

function getToolLayer(toolName: string): number {
  return TOOL_LAYERS[toolName] || TOOL_LAYERS.default;
}

export const handleTool = async (toolName: ToolName, parameters: any) => {
  const { addToolExecution, completeToolExecution, failToolExecution, addAuditLog } = useAgentFlowStore.getState();
  
  const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const layer = getToolLayer(toolName);
  
  // Track tool execution start
  addToolExecution({
    id: executionId,
    name: toolName,
    status: "executing",
    startTime: Date.now(),
    input: parameters,
    layer,
  });

  console.log("Handle tool", toolName, parameters);
  
  try {
    if (functionsMap[toolName]) {
      const result = await functionsMap[toolName](parameters);
      
      // If the tool returned an error object, we log it for the Rescue Team
      if (result && result.ok === false) {
        console.warn(`Tool ${toolName} returned an error:`, result.error);
        failToolExecution(executionId, result.error || "Tool returned error");
        addAuditLog({
          type: "error",
          message: `Tool ${toolName} returned error: ${result.error}`,
          severity: "warn",
          metadata: { toolName, error: result.error, suggest_rescue: result.suggest_rescue },
        });
      } else {
        completeToolExecution(executionId, result);
      }
      
      return result;
    } else {
      throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Critical failure in tool ${toolName}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown critical error";
    
    failToolExecution(executionId, errorMessage);
    addAuditLog({
      type: "rescue",
      message: `Critical failure in ${toolName} - Rescue Team may be needed`,
      severity: "error",
      metadata: { toolName, error: errorMessage },
    });
    
    return {
      ok: false,
      error: errorMessage,
      suggest_rescue: true,
      tool_name: toolName
    };
  }
};

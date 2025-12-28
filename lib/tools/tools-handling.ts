import { functionsMap } from "../../config/functions";

type ToolName = keyof typeof functionsMap;

export const handleTool = async (toolName: ToolName, parameters: any) => {
  console.log("Handle tool", toolName, parameters);
  try {
    if (functionsMap[toolName]) {
      const result = await functionsMap[toolName](parameters);
      
      // If the tool returned an error object, we log it for the Rescue Team
      if (result && result.ok === false) {
        console.warn(`Tool ${toolName} returned an error:`, result.error);
      }
      
      return result;
    } else {
      throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Critical failure in tool ${toolName}:`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown critical error",
      suggest_rescue: true,
      tool_name: toolName
    };
  }
};

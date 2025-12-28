// GenTel™ v1 Function Schemas
// Design goals: small surface area, composable, deterministic outputs, explicit auth scopes, auditability.

export const toolsList = [
  // ============================================
  // 13) ADAPTIVE GRAPH-LITE ARCHITECTURE (AGLA)
  // ============================================
  {
    name: "agla_semantic_router",
    description: "Categorize user intent to determine the optimal RAG path (Fast, Graph, or Complex).",
    parameters: {
      query: { type: "string", description: "The user query to route" },
    },
  },
  {
    name: "agla_graph_search",
    description: "Perform a LightRAG-style dual-level graph traversal for multi-hop reasoning and thematic synthesis.",
    parameters: {
      query: { type: "string", description: "The query to search in the graph" },
      depth: { type: "number", description: "Traversal depth (default 2)" },
    },
  },
  {
    name: "agla_hybrid_search",
    description: "Execute a hybrid search combining dense vector similarity and BM25 lexical matching with RRF fusion.",
    parameters: {
      query: { type: "string", description: "The search query" },
      limit: { type: "number", description: "Number of results to return (default 10)" },
    },
  },
  {
    name: "agla_rerank",
    description: "Rerank a set of candidate documents using FlashRank (fast) or Cross-Encoders (complex).",
    parameters: {
      query: { type: "string", description: "The original query" },
      documents: { type: "array", items: { type: "string" }, description: "List of document contents to rerank" },
      mode: { type: "string", enum: ["fast", "complex"], description: "Reranking mode" },
    },
  },
  {
    name: "agla_grader",
    description: "Grade retrieval relevance, hallucination risk, or answer quality.",
    parameters: {
      type: { type: "string", enum: ["retrieval", "hallucination", "answer"], description: "Type of grading to perform" },
      query: { type: "string", description: "The user query" },
      context: { type: "string", description: "The retrieved context or evidence" },
      response: { type: "string", description: "The generated response (for hallucination/answer grading)" },
    },
  },
  {
    name: "agla_semantic_cache",
    description: "Check or set the semantic cache for a query to avoid redundant compute.",
    parameters: {
      operation: { type: "string", enum: ["get", "set"], description: "Cache operation" },
      query: { type: "string", description: "The user query" },
      response: { type: "string", description: "The response to cache (for 'set' operation)" },
    },
  },

  // ============================================
  // 1) WEB & KNOWLEDGE
  // ============================================
  {
    name: "web_fetch",
    description: "Fetch and extract content from a URL. Can extract text, links, and tables.",
    parameters: {
      url: {
        type: "string",
        description: "The URL to fetch",
      },
      extract: {
        type: "array",
        description: "What to extract: text, links, tables",
        items: { type: "string", enum: ["text", "links", "tables"] },
      },
      max_chars: {
        type: "number",
        description: "Maximum characters to return (default 50000)",
      },
    },
  },
  {
    name: "rss_subscribe",
    description: "Subscribe to an RSS feed for polling later",
    parameters: {
      url: {
        type: "string",
        description: "The RSS feed URL",
      },
    },
  },
  {
    name: "rss_poll",
    description: "Poll an RSS feed for new items",
    parameters: {
      feed_id: {
        type: "string",
        description: "The feed ID from rss_subscribe",
      },
      since: {
        type: "string",
        description: "ISO timestamp to filter items after (optional)",
      },
      limit: {
        type: "number",
        description: "Maximum items to return (default 20)",
      },
    },
  },

  // ============================================
  // 2) PERSISTENCE (KV Store)
  // ============================================
  {
    name: "kv_get",
    description: "Get a value from persistent key-value storage",
    parameters: {
      key: {
        type: "string",
        description: "The key to retrieve",
      },
    },
  },
  {
    name: "kv_set",
    description: "Set a value in persistent key-value storage",
    parameters: {
      key: {
        type: "string",
        description: "The key to set",
      },
      value: {
        type: "string",
        description: "The value to store (will be JSON stringified if object)",
      },
    },
  },
  {
    name: "kv_list",
    description: "List keys in persistent storage with optional prefix filter",
    parameters: {
      prefix: {
        type: "string",
        description: "Filter keys by prefix (optional)",
      },
      limit: {
        type: "number",
        description: "Maximum keys to return (default 100)",
      },
    },
  },
  {
    name: "kv_delete",
    description: "Delete a key from persistent storage",
    parameters: {
      key: {
        type: "string",
        description: "The key to delete",
      },
    },
  },

  // ============================================
  // 3) CALENDAR / TASKS / REMINDERS
  // ============================================
  {
    name: "calendar_list_events",
    description: "List upcoming calendar events (requires Google OAuth)",
    parameters: {
      days_ahead: {
        type: "number",
        description: "Number of days ahead to look (default 7)",
      },
      limit: {
        type: "number",
        description: "Maximum events to return (default 10)",
      },
    },
  },
  {
    name: "tasks_create",
    description: "Create a task/reminder for the user",
    parameters: {
      title: {
        type: "string",
        description: "The task title",
      },
      due: {
        type: "string",
        description: "Due date in YYYY-MM-DD format (optional)",
      },
      priority: {
        type: "string",
        description: "Priority level",
        enum: ["low", "medium", "high"],
      },
      notes: {
        type: "string",
        description: "Additional notes (optional)",
      },
    },
  },

  // ============================================
  // 4) FILES / DOCS
  // ============================================
  {
    name: "files_upload",
    description: "Upload a file to storage and get a file_id",
    parameters: {
      name: {
        type: "string",
        description: "Filename with extension",
      },
      mime: {
        type: "string",
        description: "MIME type (e.g., text/plain, application/pdf)",
      },
      content: {
        type: "string",
        description: "File content (text) or base64 for binary",
      },
      encoding: {
        type: "string",
        description: "Content encoding: text or base64",
        enum: ["text", "base64"],
      },
    },
  },
  {
    name: "files_list",
    description: "List uploaded files",
    parameters: {
      limit: {
        type: "number",
        description: "Maximum files to return (default 50)",
      },
    },
  },
  {
    name: "files_download",
    description: "Download a file by ID",
    parameters: {
      file_id: {
        type: "string",
        description: "The file ID to download",
      },
    },
  },

  // ============================================
  // 5) GITHUB (Expanded)
  // ============================================
  {
    name: "github_list_repos",
    description: "List repositories for the authenticated user",
    parameters: {},
  },
  {
    name: "github_create_repo",
    description: "Create a new GitHub repository",
    parameters: {
      name: {
        type: "string",
        description: "The name of the repository",
      },
      description: {
        type: "string",
        description: "The description of the repository",
      },
      private: {
        type: "boolean",
        description: "Whether the repository should be private",
      },
    },
  },
  {
    name: "github_get_file_content",
    description: "Get the content of a file in a GitHub repository",
    parameters: {
      owner: {
        type: "string",
        description: "The owner of the repository",
      },
      repo: {
        type: "string",
        description: "The name of the repository",
      },
      path: {
        type: "string",
        description: "The path to the file",
      },
    },
  },
  {
    name: "github_create_file",
    description: "Create or update a file in a GitHub repository",
    parameters: {
      owner: {
        type: "string",
        description: "The owner of the repository",
      },
      repo: {
        type: "string",
        description: "The name of the repository",
      },
      path: {
        type: "string",
        description: "The path to the file",
      },
      content: {
        type: "string",
        description: "The content of the file",
      },
      message: {
        type: "string",
        description: "The commit message",
      },
    },
  },
  {
    name: "github_create_issue",
    description: "Create a new issue in a GitHub repository",
    parameters: {
      owner: {
        type: "string",
        description: "The owner of the repository",
      },
      repo: {
        type: "string",
        description: "The name of the repository",
      },
      title: {
        type: "string",
        description: "The issue title",
      },
      body: {
        type: "string",
        description: "The issue body/description",
      },
      labels: {
        type: "array",
        description: "Labels to apply",
        items: { type: "string" },
      },
    },
  },
  {
    name: "github_open_pr",
    description: "Open a pull request in a GitHub repository",
    parameters: {
      owner: {
        type: "string",
        description: "The owner of the repository",
      },
      repo: {
        type: "string",
        description: "The name of the repository",
      },
      title: {
        type: "string",
        description: "The PR title",
      },
      head: {
        type: "string",
        description: "The branch with changes",
      },
      base: {
        type: "string",
        description: "The branch to merge into",
      },
      body: {
        type: "string",
        description: "The PR description",
      },
    },
  },

  // ============================================
  // 6) UTILITY
  // ============================================
  {
    name: "get_weather",
    description: "Get the weather for a given location",
    parameters: {
      location: {
        type: "string",
        description: "Location to get weather for",
      },
      unit: {
        type: "string",
        description: "Unit to get weather in",
        enum: ["celsius", "fahrenheit"],
      },
    },
  },
  {
    name: "get_joke",
    description: "Get a programming joke",
    parameters: {},
  },

  // ============================================
  // 7) GOVERNANCE & VERIFICATION (Layer 3)
  // ============================================
  {
    name: "verify_fact",
    description: "Verify a claim against provided evidence or citations. Use this to prevent hallucinations.",
    parameters: {
      claim: {
        type: "string",
        description: "The claim to verify",
      },
      evidence: {
        type: "string",
        description: "The source text or citations to check against",
      },
    },
  },
  {
    name: "memory_judge",
    description: "Approve or reject a proposed memory write based on relevance, confidence, and TTL.",
    parameters: {
      key: {
        type: "string",
        description: "The key to store",
      },
      value: {
        type: "string",
        description: "The value to store",
      },
      reasoning: {
        type: "string",
        description: "Why this information is worth persisting",
      },
    },
  },
  {
    name: "risk_scorer",
    description: "Evaluate the likelihood of hallucination or error in a proposed response.",
    parameters: {
      response_draft: {
        type: "string",
        description: "The draft response to evaluate",
      },
    },
  },

  // ============================================
  // 8) SPECIALISTS (Layer 2 - Expanded)
  // ============================================
  {
    name: "specialist_summarizer",
    description: "Condense large amounts of text into key points while preserving entities.",
    parameters: {
      text: { type: "string", description: "Text to summarize" },
      focus: { type: "string", description: "Specific aspect to focus on (optional)" },
    },
  },
  {
    name: "specialist_planner",
    description: "Break down a complex goal into a sequence of tool calls and verification steps.",
    parameters: {
      goal: { type: "string", description: "The high-level goal" },
    },
  },
  {
    name: "specialist_qa_checker",
    description: "Review a proposed answer against the original user intent and constraints.",
    parameters: {
      answer: { type: "string", description: "The proposed answer" },
      intent: { type: "string", description: "The original user intent" },
    },
  },

  // ============================================
  // 9) MARKET & RESOURCES (Layer 6)
  // ============================================
  {
    name: "market_resource_quote",
    description: "Get a token and time estimate for a complex task.",
    parameters: {
      task_description: { type: "string", description: "Description of the work" },
    },
  },
  {
    name: "market_budget_check",
    description: "Check remaining session budget and get approval for high-compute tasks.",
    parameters: {
      estimated_cost: { type: "number", description: "Estimated token cost" },
    },
  },

  // ============================================
  // 10) AUDIT & LOGGING (Layer 5)
  // ============================================
  {
    name: "audit_log_event",
    description: "Log a significant decision or tool outcome for post-hoc review.",
    parameters: {
      event_type: { type: "string", description: "Type of event (e.g., tool_call, decision, error)" },
      details: { type: "string", description: "JSON string of event details" },
    },
  },

  // ============================================
  // 11) RESCUE TEAM (Layer 7)
  // ============================================
  {
    name: "specialist_rescue",
    description: "Invoke the Rescue Team to diagnose and fix a failing tool or system component.",
    parameters: {
      tool_name: { type: "string", description: "The name of the failing tool" },
      error_message: { type: "string", description: "The error message received" },
      context: { type: "string", description: "Additional context about the failure" },
    },
  },

  // ============================================
  // 12) WORKSPACE (Autogen-like)
  // ============================================
  {
    name: "workspace_read_file",
    description: "Read a file from the local workspace.",
    parameters: {
      path: { type: "string", description: "Relative path to the file" },
    },
  },
  {
    name: "workspace_write_file",
    description: "Write or update a file in the local workspace.",
    parameters: {
      path: { type: "string", description: "Relative path to the file" },
      content: { type: "string", description: "Content to write" },
    },
  },
  {
    name: "workspace_list_files",
    description: "List files in the local workspace.",
    parameters: {
      path: { type: "string", description: "Relative path to the directory (default: .)" },
    },
  },
];

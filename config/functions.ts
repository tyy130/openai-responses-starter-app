// GenTel™ v1 Functions Mapping
// Each tool call has a corresponding function that calls the API route

// ============================================
// ADAPTIVE GRAPH-LITE ARCHITECTURE (AGLA)
// ============================================
export const agla_semantic_router = async (params: { query: string }) => {
  const res = await fetch("/api/functions/agla/semantic_router", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const agla_graph_search = async (params: { query: string; depth?: number }) => {
  const res = await fetch("/api/functions/agla/graph_search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const agla_hybrid_search = async (params: { query: string; limit?: number }) => {
  const res = await fetch("/api/functions/agla/hybrid_search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const agla_rerank = async (params: { query: string; documents: string[]; mode?: string }) => {
  const res = await fetch("/api/functions/agla/rerank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const agla_grader = async (params: { type: string; query: string; context: string; response?: string }) => {
  const res = await fetch("/api/functions/agla/grader", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const agla_semantic_cache = async (params: { operation: string; query: string; response?: string }) => {
  const res = await fetch("/api/functions/agla/semantic_cache", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// UTILITY
// ============================================
export const get_weather = async ({
  location,
  unit,
}: {
  location: string;
  unit: string;
}) => {
  const res = await fetch(
    `/api/functions/get_weather?location=${location}&unit=${unit}`
  ).then((res) => res.json());
  return res;
};

export const get_joke = async () => {
  const res = await fetch(`/api/functions/get_joke`).then((res) => res.json());
  return res;
};

// ============================================
// WEB & KNOWLEDGE
// ============================================
export const web_fetch = async (params: {
  url: string;
  extract?: string[];
  max_chars?: number;
}) => {
  const res = await fetch("/api/functions/web_fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const rss_subscribe = async (params: { url: string }) => {
  const res = await fetch("/api/functions/rss/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const rss_poll = async (params: {
  feed_id: string;
  since?: string;
  limit?: number;
}) => {
  const res = await fetch("/api/functions/rss/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// PERSISTENCE (KV Store)
// ============================================
export const kv_get = async (params: { key: string }) => {
  const res = await fetch(`/api/functions/kv/get?key=${encodeURIComponent(params.key)}`).then(
    (res) => res.json()
  );
  return res;
};

export const kv_set = async (params: { key: string; value: string }) => {
  const res = await fetch("/api/functions/kv/set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const kv_list = async (params: { prefix?: string; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params.prefix) searchParams.set("prefix", params.prefix);
  if (params.limit) searchParams.set("limit", String(params.limit));
  const res = await fetch(`/api/functions/kv/list?${searchParams}`).then((res) =>
    res.json()
  );
  return res;
};

export const kv_delete = async (params: { key: string }) => {
  const res = await fetch("/api/functions/kv/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// CALENDAR / TASKS
// ============================================
export const calendar_list_events = async (params: {
  days_ahead?: number;
  limit?: number;
}) => {
  const res = await fetch("/api/functions/calendar/list_events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const tasks_create = async (params: {
  title: string;
  due?: string;
  priority?: string;
  notes?: string;
}) => {
  const res = await fetch("/api/functions/tasks/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// FILES / DOCS
// ============================================
export const files_upload = async (params: {
  name: string;
  mime: string;
  content: string;
  encoding?: string;
}) => {
  const res = await fetch("/api/functions/files/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const files_list = async (params: { limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  const res = await fetch(`/api/functions/files/list?${searchParams}`).then(
    (res) => res.json()
  );
  return res;
};

export const files_download = async (params: { file_id: string }) => {
  const res = await fetch(
    `/api/functions/files/download?file_id=${encodeURIComponent(params.file_id)}`
  ).then((res) => res.json());
  return res;
};

// ============================================
// GITHUB
// ============================================
export const github_list_repos = async () => {
  const res = await fetch("/api/functions/github/list_repos").then((res) =>
    res.json()
  );
  return res;
};

export const github_create_repo = async (params: {
  name: string;
  description?: string;
  private?: boolean;
}) => {
  const res = await fetch("/api/functions/github/create_repo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const github_get_file_content = async (params: {
  owner: string;
  repo: string;
  path: string;
}) => {
  const res = await fetch(
    `/api/functions/github/get_file_content?owner=${params.owner}&repo=${params.repo}&path=${params.path}`
  ).then((res) => res.json());
  return res;
};

export const github_create_file = async (params: {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
}) => {
  const res = await fetch("/api/functions/github/create_file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const github_create_issue = async (params: {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
}) => {
  const res = await fetch("/api/functions/github/create_issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const github_open_pr = async (params: {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
}) => {
  const res = await fetch("/api/functions/github/open_pr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// GOVERNANCE & VERIFICATION
// ============================================
export const verify_fact = async (params: { claim: string; evidence: string }) => {
  const res = await fetch("/api/functions/verify_fact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const memory_judge = async (params: {
  key: string;
  value: string;
  reasoning: string;
}) => {
  const res = await fetch("/api/functions/memory_judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const risk_scorer = async (params: { response_draft: string }) => {
  const res = await fetch("/api/functions/risk_scorer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// SPECIALISTS (Layer 2)
// ============================================
export const specialist_summarizer = async (params: { text: string; focus?: string }) => {
  const res = await fetch("/api/functions/specialists/summarizer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const specialist_planner = async (params: { goal: string }) => {
  const res = await fetch("/api/functions/specialists/planner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const specialist_qa_checker = async (params: { answer: string; intent: string }) => {
  const res = await fetch("/api/functions/specialists/qa_checker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const specialist_coder = async (params: {
  task: string;
  files?: string[];
}) => {
  const res = await fetch("/api/functions/specialists/coder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// MARKET & RESOURCES (Layer 6)
// ============================================
export const market_resource_quote = async (params: { task_description: string }) => {
  const res = await fetch("/api/functions/market/resource_quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const market_budget_check = async (params: { estimated_cost: number }) => {
  const res = await fetch("/api/functions/market/budget_check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// AUDIT & LOGGING (Layer 5)
// ============================================
export const audit_log_event = async (params: { event_type: string; details: string }) => {
  const res = await fetch("/api/functions/audit/log_event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// RESCUE TEAM (Layer 7)
// ============================================
export const specialist_rescue = async (params: {
  tool_name: string;
  error_message: string;
  context?: string;
}) => {
  const res = await fetch("/api/functions/specialists/rescue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// ============================================
// WORKSPACE
// ============================================
export const workspace_read_file = async (params: { path: string }) => {
  const res = await fetch("/api/functions/workspace/read_file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const workspace_write_file = async (params: {
  path: string;
  content: string;
}) => {
  const res = await fetch("/api/functions/workspace/write_file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

export const workspace_list_files = async (params: { path?: string }) => {
  const res = await fetch("/api/functions/workspace/list_files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());
  return res;
};

// Legacy manage_memory - kept for backward compatibility
export const manage_memory = async (params: { key: string; value: string }) => {
  return kv_set(params);
};

// ============================================
// FUNCTIONS MAP
// ============================================
export const functionsMap = {
  // AGLA
  agla_semantic_router,
  agla_graph_search,
  agla_hybrid_search,
  agla_rerank,
  agla_grader,
  agla_semantic_cache,
  // Utility
  get_weather,
  get_joke,
  // Web & Knowledge
  web_fetch,
  rss_subscribe,
  rss_poll,
  // Persistence
  kv_get,
  kv_set,
  kv_list,
  kv_delete,
  // Calendar / Tasks
  calendar_list_events,
  tasks_create,
  // Files
  files_upload,
  files_list,
  files_download,
  // GitHub
  github_list_repos,
  github_create_repo,
  github_get_file_content,
  github_create_file,
  github_create_issue,
  github_open_pr,
  // Governance
  verify_fact,
  memory_judge,
  risk_scorer,
  // Specialists
  specialist_summarizer,
  specialist_planner,
  specialist_qa_checker,
  specialist_coder,
  specialist_rescue,
  // Market
  market_resource_quote,
  market_budget_check,
  // Audit
  audit_log_event,
  // Workspace
  workspace_read_file,
  workspace_write_file,
  workspace_list_files,
  // Legacy
  manage_memory,
};

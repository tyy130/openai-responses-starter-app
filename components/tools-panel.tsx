"use client";
import React from "react";
import dynamic from "next/dynamic";
import FileSearchSetup from "./file-search-setup";
import WebSearchConfig from "./websearch-config";
import FunctionsView from "./functions-view";
import MemoryView from "./memory-view";
import McpConfig from "./mcp-config";
import PanelConfig from "./panel-config";
import useToolsStore from "@/stores/useToolsStore";

import { RotateCcw, Brain } from "lucide-react";
import useConversationStore from "@/stores/useConversationStore";

const GoogleIntegrationPanel = dynamic(() => import("@/components/google-integration"), { ssr: false });
const GithubIntegrationPanel = dynamic(() => import("@/components/github-integration"), { ssr: false });
const AdminCdnPanel = dynamic(() => import("./admin-cdn"), { ssr: false });

export default function ContextPanel() {
  const { resetConversation } = useConversationStore();
  const {
    fileSearchEnabled,
    setFileSearchEnabled,
    webSearchEnabled,
    setWebSearchEnabled,
    functionsEnabled,
    setFunctionsEnabled,
    googleIntegrationEnabled,
    setGoogleIntegrationEnabled,
    githubEnabled,
    setGithubEnabled,
    mcpEnabled,
    setMcpEnabled,
    codeInterpreterEnabled,
    setCodeInterpreterEnabled,
  } = useToolsStore();
  const [oauthConfigured, setOauthConfigured] = React.useState<boolean>(false);
  const [githubOauthConfigured, setGithubOauthConfigured] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch("/api/oauth/google/status")
      .then((r) => r.json())
      .then((d) => setOauthConfigured(Boolean(d.oauthConfigured)))
      .catch(() => setOauthConfigured(false));

    fetch("/api/oauth/github/status")
      .then((r) => r.json())
      .then((d) => setGithubOauthConfigured(Boolean(d.oauthConfigured)))
      .catch(() => setGithubOauthConfigured(false));
  }, []);
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border bg-muted/10">
        <MemoryView />
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <PanelConfig
          title="Core Knowledge Base"
          tooltip="Connect or upload your internal knowledge base (vector store) so the assistant can reference internal docs."
          enabled={fileSearchEnabled}
          setEnabled={setFileSearchEnabled}
        >
          <FileSearchSetup />
        </PanelConfig>
        <PanelConfig
          title="Web Search"
          tooltip="Allow the assistant to search the web for up-to-date information"
          enabled={webSearchEnabled}
          setEnabled={setWebSearchEnabled}
        >
          <WebSearchConfig />
        </PanelConfig>
        <PanelConfig
          title="Code Interpreter"
          tooltip="Allow the assistant to run Python code for data analysis or transforming files"
          enabled={codeInterpreterEnabled}
          setEnabled={setCodeInterpreterEnabled}
        />
        <PanelConfig
          title="Functions"
          tooltip="Use small callable functions (get_weather, get_joke) to extend the assistant"
          enabled={functionsEnabled}
          setEnabled={setFunctionsEnabled}
        >
          <FunctionsView />
        </PanelConfig>
        <PanelConfig
          title="MCP"
          tooltip="Call external tool servers (MCP) to extend capabilities"
          enabled={mcpEnabled}
          setEnabled={setMcpEnabled}
        >
          <McpConfig />
        </PanelConfig>
        <PanelConfig
          title="Google Integration"
          tooltip="Connect your Google account to enable Gmail and Calendar features."
          enabled={oauthConfigured && googleIntegrationEnabled}
          setEnabled={setGoogleIntegrationEnabled}
          disabled={!oauthConfigured}
        >
          <GoogleIntegrationPanel />
        </PanelConfig>
        <PanelConfig
          title="GitHub Integration"
          tooltip="Connect your GitHub account to allow the assistant to manage repositories and files"
          enabled={githubOauthConfigured && githubEnabled}
          setEnabled={setGithubEnabled}
          disabled={!githubOauthConfigured}
        >
          <GithubIntegrationPanel />
        </PanelConfig>
        {/* Admin CDN panel - visible in tools for configuration (protect in production) */}
        <PanelConfig
          title="CDN Admin"
          tooltip="Configure CDN base and signing (admin only, not protected in this demo)"
          enabled={true}
          setEnabled={() => {}}
        >
          <AdminCdnPanel />
        </PanelConfig>
      </div>
    </div>
  );
}

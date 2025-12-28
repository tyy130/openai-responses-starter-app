"use client";
import React from "react";
import { Brain, RefreshCw, Trash2 } from "lucide-react";
import { Switch } from "./ui/switch";

export default function MemoryView() {
  const [memories, setMemories] = React.useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [enabled, setEnabled] = React.useState(true);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/functions/get_memory");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMemories(data);
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMemories();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMemories, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-primary" />
          <h3 className="text-sm font-semibold">Persistent Memory</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchMemories}
            disabled={loading}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Information the assistant has learned about you and your preferences.
      </p>

      {memories.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
          {memories.map((m) => (
            <div key={m.key} className="text-xs p-2 bg-background rounded-lg border border-border group relative">
              <span className="font-bold text-primary uppercase tracking-tighter text-[10px] block mb-1">{m.key}</span>
              <p className="text-foreground/80 leading-relaxed">{m.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-center py-4 text-muted-foreground italic">
          No memories stored yet.
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Bot, Upload, Mic, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export default function AgentTab() {
  const [agentName, setAgentName] = useState("AIVA");
  const [roleTitle, setRoleTitle] = useState("AI Assistant");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [personality, setPersonality] = useState("professional");
  const [greeting, setGreeting] = useState("Hello! How can I help you today?");
  const [customInstructions, setCustomInstructions] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">AI Agent</h2>
        <p className="text-sm text-muted mt-1">Customize your AI agent's identity, personality, and capabilities.</p>
      </div>

      <hr className="border-foreground/[0.06]" />

      {/* Agent Identity */}
      <div className="border border-foreground/[0.08] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-muted" />
          <h3 className="font-semibold">Agent Identity</h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-accent text-lg font-bold">
              {agentName.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{agentName}</div>
              <div className="text-xs text-muted">{roleTitle}</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/[0.1] text-sm font-medium hover:bg-foreground/[0.03] transition-colors">
            <Upload className="w-4 h-4" /> Upload Avatar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Agent Name</label>
            <input value={agentName} onChange={e => setAgentName(e.target.value)}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
            <p className="text-xs text-muted mt-1">This is how your AI will identify itself.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Role / Title</label>
            <input value={roleTitle} onChange={e => setRoleTitle(e.target.value)}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <span>✉</span> Agent Email
            </label>
            <input value={agentEmail} onChange={e => setAgentEmail(e.target.value)} placeholder="agent@yourcompany.com"
              className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
            <p className="text-xs text-muted mt-1">Email for agent communications and notifications.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <span>📞</span> Agent Phone
            </label>
            <input value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="+1 (555) 123-4567"
              className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
            <p className="text-xs text-muted mt-1">Phone number for voice calls and SMS.</p>
          </div>
        </div>
      </div>

      {/* Personality & Behavior */}
      <div className="border border-foreground/[0.08] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h3 className="font-semibold">Personality & Behavior</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Personality Type</label>
          <select value={personality} onChange={e => setPersonality(e.target.value)}
            className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors">
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Greeting Message</label>
          <input value={greeting} onChange={e => setGreeting(e.target.value)}
            className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
          <p className="text-xs text-muted mt-1">The first message your agent sends when starting a conversation.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Custom Instructions (Optional)</label>
          <textarea value={customInstructions} onChange={e => setCustomInstructions(e.target.value)} rows={3}
            placeholder="Add specific instructions for how your agent should behave, respond, or handle certain situations..."
            className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" />
          <p className="text-xs text-muted mt-1">Provide additional context or rules for your agent to follow.</p>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="border border-foreground/[0.08] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-muted" />
          <h3 className="font-semibold">Voice Settings</h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-muted" />
            <div>
              <div className="text-sm font-medium">Enable Voice</div>
              <div className="text-xs text-muted">Allow agent to speak using text-to-speech</div>
            </div>
          </div>
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} className="data-[state=checked]:bg-accent" />
        </div>

        {voiceEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5">Voice</label>
              <select className="w-full bg-foreground/[0.03] border border-foreground/[0.1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors">
                <option>AIVA Default</option>
                <option>Natural Female</option>
                <option>Natural Male</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Speed</label>
                  <span className="text-sm text-muted">{speed[0]}x</span>
                </div>
                <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.1} className="[&>span>span]:bg-foreground" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Pitch</label>
                  <span className="text-sm text-muted">{pitch[0]}x</span>
                </div>
                <Slider value={pitch} onValueChange={setPitch} min={0.5} max={2} step={0.1} className="[&>span>span]:bg-foreground" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

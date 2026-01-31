import { useState, useCallback } from 'react';
import { 
  MessageSquare, 
  Code, 
  Wrench, 
  Settings,
  Boxes,
  Wifi,
  WifiOff
} from 'lucide-react';
import { ChatPanel } from './components/ChatPanel';
import { CodeEditor } from './components/CodeEditor';
import { MCPToolsPanel } from './components/MCPToolsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { useOllama } from './hooks/useOllama';
import type { Message, RobloxScript, MCPTool } from './types';
import { cn } from './utils/cn';

const defaultScripts: RobloxScript[] = [
  {
    id: '1',
    name: 'PlayerJoin',
    type: 'Script',
    code: `-- Player Join Handler
local Players = game:GetService("Players")

local function onPlayerAdded(player)
    print("Player joined: " .. player.Name)
    
    -- Create leaderstats
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 100
    coins.Parent = leaderstats
end

Players.PlayerAdded:Connect(onPlayerAdded)`,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'CoinPickup',
    type: 'LocalScript',
    code: `-- Coin Pickup System
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local coinEvent = ReplicatedStorage:WaitForChild("CoinCollected")

local function onCoinTouched(coin)
    if coin:FindFirstChild("Collected") then return end
    
    local tag = Instance.new("BoolValue")
    tag.Name = "Collected"
    tag.Parent = coin
    
    coinEvent:FireServer(coin)
    coin:Destroy()
end

-- Connect to all coins in workspace
for _, coin in ipairs(workspace.Coins:GetChildren()) do
    coin.Touched:Connect(function(hit)
        if hit.Parent == player.Character then
            onCoinTouched(coin)
        end
    end)
end`,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'GameUtils',
    type: 'ModuleScript',
    code: `-- Game Utilities Module
local GameUtils = {}

function GameUtils.formatNumber(num)
    if num >= 1000000 then
        return string.format("%.1fM", num / 1000000)
    elseif num >= 1000 then
        return string.format("%.1fK", num / 1000)
    end
    return tostring(num)
end

function GameUtils.lerp(a, b, t)
    return a + (b - a) * t
end

function GameUtils.randomInRange(min, max)
    return min + math.random() * (max - min)
end

function GameUtils.getPlayerFromCharacter(character)
    local Players = game:GetService("Players")
    return Players:GetPlayerFromCharacter(character)
end

return GameUtils`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

type Tab = 'chat' | 'code' | 'tools' | 'settings';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [scripts, setScripts] = useState<RobloxScript[]>(defaultScripts);
  const [streamingContent, setStreamingContent] = useState('');
  
  const { config, isLoading, error, checkConnection, sendMessage, updateConfig, clearError } = useOllama();

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setStreamingContent('');

    const response = await sendMessage(
      [...messages, userMessage],
      (chunk) => setStreamingContent(prev => prev + chunk)
    );

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setStreamingContent('');
  }, [messages, sendMessage]);

  const handleUpdateScript = useCallback((script: RobloxScript) => {
    setScripts(prev => prev.map(s => s.id === script.id ? script : s));
  }, []);

  const handleCreateScript = useCallback(() => {
    const newScript: RobloxScript = {
      id: Date.now().toString(),
      name: `Script${scripts.length + 1}`,
      type: 'Script',
      code: `-- New Script\nprint("Hello, Roblox!")`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setScripts(prev => [...prev, newScript]);
  }, [scripts.length]);

  const handleDeleteScript = useCallback((id: string) => {
    setScripts(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleRunScript = useCallback((script: RobloxScript) => {
    console.log('Running script:', script.name);
    // In a real implementation, this would connect to Roblox Studio plugin
  }, []);

  const handleRunTool = useCallback((tool: MCPTool) => {
    console.log('Tool executed:', tool.name);
  }, []);

  const tabs = [
    { id: 'chat' as Tab, label: 'AI Chat', icon: MessageSquare },
    { id: 'code' as Tab, label: 'Editor', icon: Code },
    { id: 'tools' as Tab, label: 'Tools', icon: Wrench },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Boxes className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group",
                activeTab === tab.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:text-white hover:bg-gray-800"
              )}
            >
              <tab.icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                {tab.label}
              </div>
            </button>
          ))}
        </nav>

        {/* Connection Status */}
        <div className="mt-auto">
          <div 
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              config.connected ? "bg-green-500/20" : "bg-red-500/20"
            )}
            title={config.connected ? "Ollama Connected" : "Ollama Disconnected"}
          >
            {config.connected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Primary Panel */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 bg-gray-900/50 border-b border-gray-800 flex items-center px-6">
            <h1 className="text-lg font-semibold">
              Roblox MCP
              <span className="ml-2 text-sm font-normal text-gray-400">
                {activeTab === 'chat' && '• AI Copilot'}
                {activeTab === 'code' && '• Code Editor'}
                {activeTab === 'tools' && '• Build Tools'}
                {activeTab === 'settings' && '• Configuration'}
              </span>
            </h1>
            
            {error && (
              <div className="ml-auto flex items-center gap-2 text-yellow-400 text-sm">
                <span>{error}</span>
                <button onClick={clearError} className="text-gray-500 hover:text-white">×</button>
              </div>
            )}
          </header>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <ChatPanel
                messages={messages}
                isLoading={isLoading}
                streamingContent={streamingContent}
                onSendMessage={handleSendMessage}
              />
            )}

            {activeTab === 'code' && (
              <CodeEditor
                scripts={scripts}
                onUpdateScript={handleUpdateScript}
                onCreateScript={handleCreateScript}
                onDeleteScript={handleDeleteScript}
                onRunScript={handleRunScript}
              />
            )}

            {activeTab === 'tools' && (
              <MCPToolsPanel onRunTool={handleRunTool} />
            )}

            {activeTab === 'settings' && (
              <div className="h-full overflow-y-auto">
                <SettingsPanel
                  config={config}
                  onUpdateConfig={updateConfig}
                  onCheckConnection={checkConnection}
                />
              </div>
            )}
          </div>
        </div>

        {/* Side Panel - Only show on Chat tab */}
        {activeTab === 'chat' && (
          <div className="w-80 border-l border-gray-800 hidden lg:block">
            <MCPToolsPanel onRunTool={handleRunTool} />
          </div>
        )}
      </div>
    </div>
  );
}

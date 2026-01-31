import { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import type { OllamaConfig } from '../types';
import { cn } from '../utils/cn';

interface SettingsPanelProps {
  config: OllamaConfig;
  onUpdateConfig: (updates: Partial<OllamaConfig>) => void;
  onCheckConnection: () => Promise<string[]>;
}

export function SettingsPanel({ config, onUpdateConfig, onCheckConnection }: SettingsPanelProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [localUrl, setLocalUrl] = useState(config.baseUrl);

  useEffect(() => {
    handleCheckConnection();
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    const models = await onCheckConnection();
    setAvailableModels(models.map((m: any) => m.name || m));
    setIsChecking(false);
  };

  const handleSaveUrl = () => {
    onUpdateConfig({ baseUrl: localUrl });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Ollama Connection */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {config.connected ? (
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Wifi className="w-5 h-5 text-green-400" />
              </div>
            ) : (
              <div className="p-2 bg-red-500/20 rounded-lg">
                <WifiOff className="w-5 h-5 text-red-400" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-white">Ollama Connection</h3>
              <p className={cn(
                "text-sm",
                config.connected ? "text-green-400" : "text-red-400"
              )}>
                {config.connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckConnection}
            disabled={isChecking}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 text-white", isChecking && "animate-spin")} />
          </button>
        </div>

        {!config.connected && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-200">Ollama is not running</p>
                <p className="text-xs text-yellow-400/70 mt-1">
                  Start Ollama with <code className="bg-gray-900 px-1 rounded">ollama serve</code>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Server URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                className="flex-1 bg-gray-900 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSaveUrl}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Model</label>
            <select
              value={config.model}
              onChange={(e) => onUpdateConfig({ model: e.target.value })}
              className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableModels.length > 0 ? (
                availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              ) : (
                <>
                  <option value="llama3.2">llama3.2</option>
                  <option value="codellama">codellama</option>
                  <option value="mistral">mistral</option>
                  <option value="deepseek-coder">deepseek-coder</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Setup Guide */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-medium text-white mb-3">Quick Setup</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-gray-300">Install Ollama</p>
              <a 
                href="https://ollama.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-xs mt-1"
              >
                ollama.ai <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-gray-300">Pull a model</p>
              <code className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded block mt-1">
                ollama pull llama3.2
              </code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-gray-300">Start the server</p>
              <code className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded block mt-1">
                ollama serve
              </code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <p className="text-gray-300">Click refresh to connect</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-medium text-white mb-2">About Roblox MCP</h3>
        <p className="text-sm text-gray-400">
          Model Context Protocol for Roblox development. Use AI to generate Lua scripts, 
          test game logic, and build amazing experiences.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">v1.0.0</div>
          <div className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Beta</div>
        </div>
      </div>
    </div>
  );
}

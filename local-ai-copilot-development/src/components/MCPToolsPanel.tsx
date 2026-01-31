import { useState } from 'react';
import { 
  Hammer, 
  FlaskConical, 
  Rocket, 
  Search,
  Play,
  Check,
  X,
  Loader2,
  Terminal,
  FileCode,
  Boxes,
  Gamepad2
} from 'lucide-react';
import type { MCPTool, BuildResult } from '../types';
import { cn } from '../utils/cn';

interface MCPToolsPanelProps {
  onRunTool: (tool: MCPTool) => void;
}

const defaultTools: MCPTool[] = [
  {
    id: '1',
    name: 'Build Scripts',
    description: 'Compile and validate all Lua scripts',
    category: 'build',
    status: 'ready'
  },
  {
    id: '2',
    name: 'Run Tests',
    description: 'Execute unit tests for your game',
    category: 'test',
    status: 'ready'
  },
  {
    id: '3',
    name: 'Analyze Code',
    description: 'Check for errors and optimizations',
    category: 'analyze',
    status: 'ready'
  },
  {
    id: '4',
    name: 'Deploy to Roblox',
    description: 'Publish changes to your experience',
    category: 'deploy',
    status: 'ready'
  }
];

export function MCPToolsPanel({ onRunTool }: MCPToolsPanelProps) {
  const [tools, setTools] = useState<MCPTool[]>(defaultTools);
  const [_buildResults, setBuildResults] = useState<BuildResult[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[MCP] Roblox MCP initialized',
    '[MCP] Waiting for Ollama connection...',
    '[MCP] Ready to build'
  ]);

  const getCategoryIcon = (category: MCPTool['category']) => {
    switch (category) {
      case 'build': return Hammer;
      case 'test': return FlaskConical;
      case 'deploy': return Rocket;
      case 'analyze': return Search;
    }
  };

  const getStatusIcon = (status: MCPTool['status']) => {
    switch (status) {
      case 'ready': return Play;
      case 'running': return Loader2;
      case 'success': return Check;
      case 'error': return X;
    }
  };

  const runTool = async (tool: MCPTool) => {
    // Update tool status to running
    setTools(prev => prev.map(t => 
      t.id === tool.id ? { ...t, status: 'running' as const } : t
    ));

    const newLog = `[${new Date().toLocaleTimeString()}] Running ${tool.name}...`;
    setConsoleOutput(prev => [...prev, newLog]);

    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const success = Math.random() > 0.2;
    
    setTools(prev => prev.map(t => 
      t.id === tool.id ? { 
        ...t, 
        status: success ? 'success' as const : 'error' as const,
        lastRun: new Date()
      } : t
    ));

    const resultLog = success 
      ? `[${new Date().toLocaleTimeString()}] ✓ ${tool.name} completed successfully`
      : `[${new Date().toLocaleTimeString()}] ✗ ${tool.name} failed - check errors`;
    
    setConsoleOutput(prev => [...prev, resultLog]);

    if (tool.category === 'build') {
      const result: BuildResult = {
        id: Date.now().toString(),
        status: success ? 'success' : 'error',
        logs: success 
          ? ['Compiling scripts...', 'Validating syntax...', 'Build complete!']
          : ['Compiling scripts...', 'Error: Unexpected token on line 42'],
        startTime: new Date(Date.now() - 2000),
        endTime: new Date(),
        errors: success ? [] : ['SyntaxError: Unexpected token']
      };
      setBuildResults(prev => [result, ...prev.slice(0, 4)]);
    }

    // Reset to ready after delay
    setTimeout(() => {
      setTools(prev => prev.map(t => 
        t.id === tool.id ? { ...t, status: 'ready' as const } : t
      ));
    }, 3000);

    onRunTool(tool);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">MCP Tools</h2>
            <p className="text-xs text-gray-400">Build, Test & Deploy</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(tool => {
            const CategoryIcon = getCategoryIcon(tool.category);
            const StatusIcon = getStatusIcon(tool.status);
            
            return (
              <button
                key={tool.id}
                onClick={() => runTool(tool)}
                disabled={tool.status === 'running'}
                className={cn(
                  "p-3 rounded-lg text-left transition-all",
                  "bg-gray-800 hover:bg-gray-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  tool.status === 'success' && "ring-1 ring-green-500",
                  tool.status === 'error' && "ring-1 ring-red-500"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <CategoryIcon className={cn(
                    "w-5 h-5",
                    tool.category === 'build' && "text-yellow-400",
                    tool.category === 'test' && "text-blue-400",
                    tool.category === 'analyze' && "text-purple-400",
                    tool.category === 'deploy' && "text-green-400"
                  )} />
                  <StatusIcon className={cn(
                    "w-4 h-4",
                    tool.status === 'ready' && "text-gray-500",
                    tool.status === 'running' && "text-yellow-400 animate-spin",
                    tool.status === 'success' && "text-green-400",
                    tool.status === 'error' && "text-red-400"
                  )} />
                </div>
                <p className="text-sm font-medium text-white">{tool.name}</p>
                <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Scripts */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Script Templates</h3>
        <div className="space-y-2">
          {[
            { name: 'LocalScript', icon: FileCode, desc: 'Client-side script' },
            { name: 'Script', icon: Terminal, desc: 'Server-side script' },
            { name: 'ModuleScript', icon: Boxes, desc: 'Reusable module' }
          ].map(item => (
            <button
              key={item.name}
              className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors"
            >
              <item.icon className="w-4 h-4 text-gray-400" />
              <div className="text-left">
                <p className="text-sm text-white">{item.name}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Console Output */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-400">Console</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
          {consoleOutput.map((line, i) => (
            <div 
              key={i} 
              className={cn(
                "text-gray-400",
                line.includes('✓') && "text-green-400",
                line.includes('✗') && "text-red-400",
                line.includes('Error') && "text-red-400"
              )}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Roblox Connection */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm text-white">Roblox Studio</p>
            <p className="text-xs text-gray-500">Plugin not connected</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

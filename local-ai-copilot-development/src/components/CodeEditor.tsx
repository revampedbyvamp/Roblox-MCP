import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  FileCode, 
  Plus, 
  Save, 
  Play, 
  Trash2,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import type { RobloxScript } from '../types';
import { cn } from '../utils/cn';

interface CodeEditorProps {
  scripts: RobloxScript[];
  onUpdateScript: (script: RobloxScript) => void;
  onCreateScript: () => void;
  onDeleteScript: (id: string) => void;
  onRunScript: (script: RobloxScript) => void;
}

export function CodeEditor({ 
  scripts, 
  onUpdateScript, 
  onCreateScript, 
  onDeleteScript,
  onRunScript 
}: CodeEditorProps) {
  const [activeScriptId, setActiveScriptId] = useState<string | null>(scripts[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copied, setCopied] = useState(false);

  const activeScript = scripts.find(s => s.id === activeScriptId);

  const handleEdit = () => {
    if (activeScript) {
      setEditValue(activeScript.code);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (activeScript) {
      onUpdateScript({
        ...activeScript,
        code: editValue,
        updatedAt: new Date()
      });
      setIsEditing(false);
    }
  };

  const handleCopy = () => {
    if (activeScript) {
      navigator.clipboard.writeText(activeScript.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScriptTypeColor = (type: RobloxScript['type']) => {
    switch (type) {
      case 'LocalScript': return 'text-blue-400';
      case 'Script': return 'text-yellow-400';
      case 'ModuleScript': return 'text-purple-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Code Editor</h2>
              <p className="text-xs text-gray-400">Lua Scripts</p>
            </div>
          </div>
          <button
            onClick={onCreateScript}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Script Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-700 overflow-x-auto">
        {scripts.map(script => (
          <button
            key={script.id}
            onClick={() => {
              setActiveScriptId(script.id);
              setIsEditing(false);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors",
              activeScriptId === script.id
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <FileCode className={cn("w-3.5 h-3.5", getScriptTypeColor(script.type))} />
            {script.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      {activeScript ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/30">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium", getScriptTypeColor(activeScript.type))}>
                {activeScript.type}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Save"
                >
                  <Save className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => onRunScript(activeScript)}
                className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded transition-colors"
                title="Run"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteScript(activeScript.id)}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 overflow-auto">
            {isEditing ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-full p-4 bg-gray-950 text-gray-100 font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
              />
            ) : (
              <SyntaxHighlighter
                language="lua"
                style={vscDarkPlus}
                customStyle={{ 
                  margin: 0, 
                  padding: '1rem',
                  background: 'transparent',
                  height: '100%',
                  fontSize: '0.875rem'
                }}
                showLineNumbers
              >
                {activeScript.code}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No scripts yet</p>
            <button
              onClick={onCreateScript}
              className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Create Script
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

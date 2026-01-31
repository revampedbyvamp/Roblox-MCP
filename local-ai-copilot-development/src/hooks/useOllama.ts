import { useState, useCallback } from 'react';
import type { Message, OllamaConfig } from '../types';

const SYSTEM_PROMPT = `You are a Roblox development expert AI assistant. You help users:
1. Write Lua scripts for Roblox games
2. Debug and optimize existing code
3. Explain Roblox Studio concepts
4. Generate game mechanics and systems
5. Test and validate code logic

When generating code, always use proper Roblox Lua patterns and best practices.
Format code blocks with \`\`\`lua syntax.
Be concise but thorough in explanations.`;

export function useOllama() {
  const [config, setConfig] = useState<OllamaConfig>({
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2',
    connected: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(`${config.baseUrl}/api/tags`, {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(prev => ({ ...prev, connected: true }));
        return data.models || [];
      }
      setConfig(prev => ({ ...prev, connected: false }));
      return [];
    } catch (e) {
      setConfig(prev => ({ ...prev, connected: false }));
      setError('Cannot connect to Ollama. Make sure it\'s running on localhost:11434');
      return [];
    }
  }, [config.baseUrl]);

  const sendMessage = useCallback(async (
    messages: Message[],
    onStream?: (chunk: string) => void
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];

      const response = await fetch(`${config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          messages: formattedMessages,
          stream: !!onStream
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      if (onStream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(Boolean);
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                fullResponse += parsed.message.content;
                onStream(parsed.message.content);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
        
        setIsLoading(false);
        return fullResponse;
      } else {
        const data = await response.json();
        setIsLoading(false);
        return data.message?.content || '';
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to communicate with Ollama';
      setError(errorMsg);
      setIsLoading(false);
      
      // Return a simulated response for demo purposes
      return generateDemoResponse(messages[messages.length - 1]?.content || '');
    }
  }, [config.baseUrl, config.model]);

  const updateConfig = useCallback((updates: Partial<OllamaConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    config,
    isLoading,
    error,
    checkConnection,
    sendMessage,
    updateConfig,
    clearError: () => setError(null)
  };
}

function generateDemoResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes('script') || lowerMsg.includes('code') || lowerMsg.includes('lua')) {
    return `Here's a Roblox Lua script example for you:

\`\`\`lua
-- Example Roblox Script
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local function onPlayerAdded(player)
    print("Welcome, " .. player.Name .. "!")
    
    -- Create leaderstats
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 0
    coins.Parent = leaderstats
end

Players.PlayerAdded:Connect(onPlayerAdded)

-- Handle players already in game
for _, player in ipairs(Players:GetPlayers()) do
    onPlayerAdded(player)
end
\`\`\`

This script sets up a basic player system with leaderstats. Would you like me to explain how it works or modify it?

**Note:** Ollama is not connected. This is a demo response. Start Ollama locally to get real AI responses.`;
  }
  
  if (lowerMsg.includes('build') || lowerMsg.includes('test')) {
    return `To build and test your Roblox game:

1. **Use the Build Tools** on the right panel to compile your scripts
2. **Run Tests** to validate your code logic
3. **Check the Console** for any errors or warnings

\`\`\`lua
-- Test script example
local TestService = game:GetService("TestService")

TestService:Run(function()
    -- Your test code here
    assert(1 + 1 == 2, "Math is broken!")
    print("All tests passed!")
end)
\`\`\`

**Note:** Ollama is not connected. Start Ollama with \`ollama serve\` to get real AI assistance.`;
  }
  
  return `I'm your Roblox MCP AI Copilot! I can help you with:

- 📝 **Writing Lua scripts** for your Roblox games
- 🔧 **Debugging code** and fixing errors
- 🎮 **Game mechanics** design and implementation
- 🧪 **Testing strategies** and validation
- 📚 **Roblox API** explanations

**Connection Status:** Ollama is not currently connected. To enable full AI features:
1. Install Ollama from https://ollama.ai
2. Run \`ollama serve\` in your terminal
3. Pull a model: \`ollama pull llama3.2\`

What would you like to build today?`;
}

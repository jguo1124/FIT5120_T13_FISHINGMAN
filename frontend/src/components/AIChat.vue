<template>
  <div class="ai-chat-container">
    <div class="chat-header">
      <div class="chat-title">
        <div class="fish-icon">🐟</div>
        <h3>Fish AI Assistant</h3>
        <span class="status-indicator" :class="{ online: isConnected }">
          {{ isConnected ? 'Online' : 'Offline' }}
        </span>
      </div>
      <button @click="resetChat" class="reset-btn" title="Reset Chat">
        🔄
      </button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" 
           class="message" 
           :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }">
        
        <div class="message-avatar">
          <span v-if="message.role === 'user'">👤</span>
          <span v-else>🐟</span>
        </div>
        
        <div class="message-content">
          <div v-if="message.content.type === 'text'" class="text-content">
            {{ message.content.text }}
          </div>
          <div v-else-if="message.content.type === 'image'" class="image-content">
            <img :src="message.content.url" alt="Uploaded image" class="uploaded-image" />
          </div>
          <div v-else-if="message.content.type === 'mixed'" class="mixed-content">
            <img v-if="message.content.image" :src="message.content.image" alt="Uploaded image" class="uploaded-image" />
            <div class="text-content">{{ message.content.text }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="message ai-message">
        <div class="message-avatar">🐟</div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-container">
      <div class="input-actions">
        <label class="file-upload-btn" :class="{ disabled: isLoading }">
          📷
          <input 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            :disabled="isLoading"
            ref="fileInput"
          />
        </label>
        <button 
          @click="toggleStreamMode" 
          class="stream-toggle"
          :class="{ active: useStreamMode }"
          title="Toggle Streaming"
        >
          {{ useStreamMode ? '⚡' : '📝' }}
        </button>
      </div>
      
      <div class="input-wrapper">
        <textarea 
          v-model="inputMessage" 
          @keydown.enter.prevent="handleSendMessage"
          @keydown.shift.enter="inputMessage += '\n'"
          placeholder="Ask about fish regulations, protected species, fishing rules, etc..."
          :disabled="isLoading"
          class="message-input"
          rows="1"
          ref="messageInput"
        ></textarea>
        <button 
          @click="handleSendMessage" 
          :disabled="!inputMessage.trim() || isLoading"
          class="send-btn"
        >
          {{ isLoading ? '⏳' : '➤' }}
        </button>
      </div>
    </div>

    <div class="suggestions" v-if="suggestions.length > 0 && messages.length === 0">
      <h4>Common Questions:</h4>
      <div class="suggestion-chips">
        <button 
          v-for="suggestion in suggestions" 
          :key="suggestion"
          @click="sendSuggestion(suggestion)"
          class="suggestion-chip"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { sendChatMessage, sendChatWithImage, sendStreamMessage } from '@/lib/api';

// 响应式数据
const messages = ref([]);
const inputMessage = ref('');
const isLoading = ref(false);
const isConnected = ref(true);
const useStreamMode = ref(true);
const messagesContainer = ref(null);
const messageInput = ref(null);
const fileInput = ref(null);

// Session ID
const sessionId = ref(`web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

// Suggested questions
const suggestions = ref([
  'What are the protected fish species in Victoria Bay?',
  'What are the size limits for fishing?',
  'Which seasons are fishing prohibited?',
  'How to identify protected species?',
  'What are the fishing quota limits?'
]);

// Auto-adjust input height
watch(inputMessage, () => {
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto';
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px';
    }
  });
});

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Add message
const addMessage = (role, content) => {
  const message = {
    id: Date.now() + Math.random(),
    role,
    content,
    timestamp: new Date()
  };
  messages.value.push(message);
  scrollToBottom();
};

// Send message
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;
  
  const userMessage = inputMessage.value.trim();
  inputMessage.value = '';
  
  // Add user message
  addMessage('user', { type: 'text', text: userMessage });
  
  isLoading.value = true;
  
  try {
    if (useStreamMode.value) {
      await handleStreamResponse(userMessage);
    } else {
      await handleNormalResponse(userMessage);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    addMessage('assistant', { 
      type: 'text', 
      text: 'Sorry, I encountered some technical issues. Please try again later or contact the administrator.' 
    });
  } finally {
    isLoading.value = false;
  }
};

// Normal response
const handleNormalResponse = async (message) => {
  const response = await sendChatMessage({
    prompt: message,
    sessionId: sessionId.value
  });
  
  addMessage('assistant', { type: 'text', text: response.answer });
};

// Streaming response
const handleStreamResponse = async (message) => {
  let fullResponse = '';
  
  const response = await sendStreamMessage({
    prompt: message,
    sessionId: sessionId.value
  });
  
  // Add a temporary AI message for streaming display
  const tempMessageId = Date.now() + Math.random();
  messages.value.push({
    id: tempMessageId,
    role: 'assistant',
    content: { type: 'text', text: '' },
    timestamp: new Date()
  });
  
  scrollToBottom();
  
  // Process streaming data
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.delta) {
              fullResponse += parsed.delta;
              // Update temporary message
              const tempMessage = messages.value.find(m => m.id === tempMessageId);
              if (tempMessage) {
                tempMessage.content.text = fullResponse;
                scrollToBottom();
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

// Handle image upload
const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file || isLoading.value) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  // Validate file size (7MB)
  if (file.size > 7 * 1024 * 1024) {
    alert('Image file cannot exceed 7MB');
    return;
  }
  
  const prompt = inputMessage.value.trim() || 'Please analyze the fish in this image and tell me about relevant regulations';
  inputMessage.value = '';
  
  // Add user message (with image)
  addMessage('user', { 
    type: 'mixed', 
    text: prompt,
    image: URL.createObjectURL(file)
  });
  
  isLoading.value = true;
  
  try {
    const response = await sendChatWithImage({
      sessionId: sessionId.value,
      prompt: prompt,
      file: file
    });
    
    addMessage('assistant', { type: 'text', text: response.answer });
  } catch (error) {
    console.error('Image upload failed:', error);
    addMessage('assistant', { 
      type: 'text', 
      text: 'Sorry, image analysis failed. Please check the image format or try again later.' 
    });
  } finally {
    isLoading.value = false;
    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

// Send suggestion
const sendSuggestion = (suggestion) => {
  inputMessage.value = suggestion;
  handleSendMessage();
};

// Reset chat
const resetChat = () => {
  if (confirm('Are you sure you want to reset the chat? This will clear all chat history.')) {
    messages.value = [];
    // Reset session ID
    sessionId.value = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Toggle streaming mode
const toggleStreamMode = () => {
  useStreamMode.value = !useStreamMode.value;
};

// Welcome message on component mount
onMounted(() => {
  addMessage('assistant', {
    type: 'text',
    text: 'Hello! I am the Fish AI Assistant🐟, specialized in answering questions about fish regulations, protected species, fishing rules, etc. You can upload fish images for me to help identify, or ask questions directly.'
  });
});
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fish-icon {
  font-size: 24px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.chat-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.status-indicator {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.status-indicator.online {
  background: #10b981;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: #3b82f6;
  color: white;
}

.ai-message .message-avatar {
  background: #10b981;
  color: white;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.user-message .message-content {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-content {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

.text-content {
  line-height: 1.5;
  white-space: pre-wrap;
}

.image-content, .mixed-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-input-container {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.file-upload-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.file-upload-btn:hover:not(.disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.file-upload-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-upload-btn input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.stream-toggle {
  width: 40px;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.stream-toggle:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.stream-toggle.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.suggestions {
  padding: 16px 20px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.suggestions h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

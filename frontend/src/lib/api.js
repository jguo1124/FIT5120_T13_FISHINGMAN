// src/lib/api.js
// AI Chat APIs

/** POST /api/ai/chat - Send chat message */
export async function sendChatMessage({ prompt, imageUrl, sessionId }) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, imageUrl, sessionId }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => '');
    throw new Error(`Chat request failed: ${response.status} ${error.slice(0, 160)}`);
  }

  return response.json();
}

/** POST /api/ai/chat-upload - Upload image and send message */
export async function sendChatWithImage({ sessionId, prompt, file }) {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('prompt', prompt);
  formData.append('file', file);

  const response = await fetch('/api/ai/chat-upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => '');
    throw new Error(`Upload request failed: ${response.status} ${error.slice(0, 160)}`);
  }

  return response.json();
}

/** POST /api/ai/stream - Streaming chat */
export async function sendStreamMessage({ prompt, imageUrl, sessionId }) {
  const response = await fetch('/api/ai/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, imageUrl, sessionId }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => '');
    throw new Error(`Stream request failed: ${response.status} ${error.slice(0, 160)}`);
  }

  return response;
}

/** POST /api/ai/session/reset - Reset session */
export async function resetChatSession(sessionId) {
  const response = await fetch('/api/ai/session/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => '');
    throw new Error(`Reset request failed: ${response.status} ${error.slice(0, 160)}`);
  }

  return response.json();
}

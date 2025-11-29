import api from '../api';
import { AssistantChatRequest, AssistantChatResponse } from '../domain/assistant';

export const sendChatMessage = async (request: AssistantChatRequest, token: string): Promise<AssistantChatResponse> => {
    console.log('[Infrastructure] Sending chat message to AI assistant:', JSON.stringify(request, null, 2));
    const response = await api.post('/assistant/chat', request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[Infrastructure] AI assistant response:', response.data);
    return response.data;
};

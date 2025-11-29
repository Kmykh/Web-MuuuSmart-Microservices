import { sendChatMessage } from '../infrastructure/assistantService';
import { AssistantChatRequest } from '../domain/assistant';

export const sendChatMessageAction = async (request: AssistantChatRequest) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    console.log('[Application] Sending chat message to AI assistant');
    return await sendChatMessage(request, token);
};

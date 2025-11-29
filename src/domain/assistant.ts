// Domain types for AI Assistant

export interface AssistantChatRequest {
    question: string;
    animalId?: number;
    stableId?: number;
}

export interface AssistantChatResponse {
    answer: string;
    timestamp?: string;
}

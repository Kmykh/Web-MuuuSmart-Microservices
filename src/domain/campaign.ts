
export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';
export type Metric = 'CONVERSIONS' | 'CLICKS' | 'VIEWS';
export type ChannelType = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'SOCIAL_MEDIA';

export interface Goal {
    id: number;
    description: string;
    metric: Metric;
    targetValue: number;
    currentValue: number;
}

export interface Channel {
    id: number;
    type: ChannelType;
    details: string | null;
}

export interface Campaign {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: CampaignStatus;
    username: string;
    stableId: number;
    goals: Goal[];
    channels: Channel[];
    createdAt: string;
    updatedAt: string;
}

// --- API Request Payloads ---

export interface CreateCampaignRequest {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    stableId: number;
}

export interface UpdateCampaignStatusRequest {
    status: CampaignStatus;
}

export interface AddGoalRequest {
    description: string;
    metric: Metric;
    targetValue: number;
    currentValue: number;
}

export interface AddChannelRequest {
    type: ChannelType;
    details?: string;
}

// --- API Response Payloads ---

export interface GoalResponse extends Goal {}
export interface ChannelResponse extends Channel {}

export interface CampaignResponse {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: CampaignStatus;
    username: string;
    stableId: number;
    goals: GoalResponse[];
    channels: ChannelResponse[];
    createdAt: string;
    updatedAt: string;
}

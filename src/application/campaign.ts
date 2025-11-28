
import * as campaignService from '../infrastructure/campaignService';
import {
    CampaignResponse,
    CreateCampaignRequest,
    UpdateCampaignStatusRequest,
    AddGoalRequest,
    AddChannelRequest,
    GoalResponse,
    ChannelResponse
} from '../domain/campaign';

const getToken = (): string => {
    const token = localStorage.getItem('token');
    console.log('🔑 [Application] Token retrieved from localStorage:', token ? `${token.substring(0, 15)}...` : 'NULL');
    if (!token) {
        console.error('❌ [Application] No token found in local storage!');
        throw new Error('No token found in local storage');
    }
    return token;
};

// --- Campaign Actions ---

export const createCampaignAction = (request: CreateCampaignRequest): Promise<CampaignResponse> => {
    return campaignService.createCampaign(request, getToken());
};

export const getAllCampaignsAction = (): Promise<CampaignResponse[]> => {
    return campaignService.getAllCampaigns(getToken());
};

export const getCampaignByIdAction = (id: number): Promise<CampaignResponse> => {
    return campaignService.getCampaignById(id, getToken());
};

export const deleteCampaignAction = (id: number): Promise<void> => {
    return campaignService.deleteCampaign(id, getToken());
};

export const updateCampaignStatusAction = (id: number, request: UpdateCampaignStatusRequest): Promise<CampaignResponse> => {
    return campaignService.updateCampaignStatus(id, request, getToken());
};

// --- Goal & Channel Actions ---

export const addGoalToCampaignAction = (id: number, request: AddGoalRequest): Promise<CampaignResponse> => {
    return campaignService.addGoalToCampaign(id, request, getToken());
};

export const addChannelToCampaignAction = (id: number, request: AddChannelRequest): Promise<CampaignResponse> => {
    return campaignService.addChannelToCampaign(id, request, getToken());
};

export const getGoalsByCampaignAction = (id: number): Promise<GoalResponse[]> => {
    return campaignService.getGoalsByCampaign(id, getToken());
};

export const getChannelsByCampaignAction = (id: number): Promise<ChannelResponse[]> => {
    return campaignService.getChannelsByCampaign(id, getToken());
};


import api from '../api';
import {
    CampaignResponse,
    CreateCampaignRequest,
    UpdateCampaignStatusRequest,
    AddGoalRequest,
    AddChannelRequest,
    GoalResponse,
    ChannelResponse
} from '../domain/campaign';

const BASE_URL = '/campaigns';

// --- Campaign Endpoints ---

export const createCampaign = async (request: CreateCampaignRequest, token: string): Promise<CampaignResponse> => {
    const response = await api.post<CampaignResponse>(BASE_URL, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getAllCampaigns = async (token: string): Promise<CampaignResponse[]> => {
    console.log('📡 [Infrastructure] Fetching all campaigns...');
    console.log('🔗 [Infrastructure] URL:', `${BASE_URL}`);
    console.log('🔑 [Infrastructure] Authorization Header:', `Bearer ${token.substring(0, 10)}...`);
    
    try {
        const response = await api.get<CampaignResponse[]>(BASE_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ [Infrastructure] Campaigns fetched successfully:', response.data.length, 'items');
        return response.data;
    } catch (error) {
        console.error('❌ [Infrastructure] Error fetching campaigns:', error);
        throw error;
    }
};

export const getCampaignById = async (id: number, token: string): Promise<CampaignResponse> => {
    const response = await api.get<CampaignResponse>(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteCampaign = async (id: number, token: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateCampaignStatus = async (id: number, request: UpdateCampaignStatusRequest, token: string): Promise<CampaignResponse> => {
    const response = await api.patch<CampaignResponse>(`${BASE_URL}/${id}/update-status`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// --- Goal & Channel Endpoints ---

export const addGoalToCampaign = async (id: number, request: AddGoalRequest, token: string): Promise<CampaignResponse> => {
    console.log(`🔗 [Infrastructure] PATCH URL: ${BASE_URL}/${id}/add-goal`);
    console.log('📦 [Infrastructure] Payload JSON:', JSON.stringify(request, null, 2));
    const response = await api.patch<CampaignResponse>(`${BASE_URL}/${id}/add-goal`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ [Infrastructure] Response from backend:', JSON.stringify(response.data, null, 2));
    return response.data;
};

export const addChannelToCampaign = async (id: number, request: AddChannelRequest, token: string): Promise<CampaignResponse> => {
    console.log(`🔗 [Infrastructure] PATCH URL: ${BASE_URL}/${id}/add-channel`);
    console.log('📦 [Infrastructure] Payload JSON:', JSON.stringify(request, null, 2));
    const response = await api.patch<CampaignResponse>(`${BASE_URL}/${id}/add-channel`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ [Infrastructure] Response from backend:', JSON.stringify(response.data, null, 2));
    return response.data;
};

export const getGoalsByCampaign = async (id: number, token: string): Promise<GoalResponse[]> => {
    console.log(`🔗 [Infrastructure] GET URL: ${BASE_URL}/${id}/goals`);
    const response = await api.get<GoalResponse[]>(`${BASE_URL}/${id}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ [Infrastructure] Goals fetched:', response.data.length);
    return response.data;
};

export const getChannelsByCampaign = async (id: number, token: string): Promise<ChannelResponse[]> => {
    console.log(`🔗 [Infrastructure] GET URL: ${BASE_URL}/${id}/channels`);
    const response = await api.get<ChannelResponse[]>(`${BASE_URL}/${id}/channels`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ [Infrastructure] Channels fetched:', response.data.length);
    return response.data;
};

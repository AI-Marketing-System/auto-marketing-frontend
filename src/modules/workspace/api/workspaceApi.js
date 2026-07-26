import { requestJson } from '../../../services/Api';

export const workspaceApi = {
  getPendingInvitations: () => {
    return requestJson('/workspaces/invitations', {
      method: 'GET',
    });
  },

  acceptInvitation: (workspaceId) => {
    return requestJson(`/workspaces/${workspaceId}/members/accept`, {
      method: 'POST',
    });
  },

  declineInvitation: (workspaceId) => {
    return requestJson(`/workspaces/${workspaceId}/members/decline`, {
      method: 'POST',
    });
  },
};

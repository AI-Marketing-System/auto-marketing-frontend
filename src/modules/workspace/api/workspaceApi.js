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

  getWorkspaceMembers: (workspaceId) => {
    return requestJson(`/workspaces/${workspaceId}/members`, {
      method: 'GET',
    });
  },

  inviteMember: (workspaceId, data) => {
    return requestJson(`/workspaces/${workspaceId}/members/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeMember: (workspaceId, userId) => {
    return requestJson(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  updateMemberRole: (workspaceId, userId, role) => {
    return requestJson(`/workspaces/${workspaceId}/members/${userId}/role?newRole=${role}`, {
      method: 'PUT',
    });
  },
};

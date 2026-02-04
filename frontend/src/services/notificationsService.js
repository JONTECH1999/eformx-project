import api from './api';

const notificationsService = {
  async list() {
    const res = await api.get('/notifications');
    return res.data || [];
  },
  async markRead(id) {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },
  async markAllRead() {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
  async deleteAll() {
    const res = await api.delete('/notifications');
    return res.data;
  },
};

export default notificationsService;

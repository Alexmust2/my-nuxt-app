import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    completedTasks: [],
    objectiveStatuses: [],
    counters: [],
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/login', credentials);
        this.user = response.data.user;
        return this.user;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    async loadUserDataFromDatabase(userId) {
      try {
        const response = await axios.get(`/api/user-data/${userId}`);
        this.completedTasks = response.data.completedTasks;
        this.objectiveStatuses = response.data.objectiveStatuses;
        this.counters = response.data.counters;
      } catch (error) {
        console.error('Failed to load user ', error);
      }
    },
    async saveCounterToDatabase({ taskId, objectiveId, count }) {
      try {
        await axios.post('/api/save-counter', { taskId, objectiveId, count });
        // Update local state if needed
      } catch (error) {
        console.error('Failed to save counter:', error);
      }
    },
    async saveObjectiveStatusToDatabase({ taskId, objectiveId, completed }) {
      try {
        await axios.post('/api/save-objective-status', { taskId, objectiveId, completed });
      } catch (error) {
        console.error('Failed to save objective status:', error);
      }
    },
    async addToCompletedTasks(taskId) {
      try {
        await axios.post('/api/complete-task', { taskId });
        this.completedTasks.push(taskId);
      } catch (error) {
        console.error('Failed to add completed task:', error);
      }
    },
    async removeFromCompletedTasks(taskId) {
      try {
        await axios.post('/api/remove-completed-task', { taskId });
        const index = this.completedTasks.indexOf(taskId);
        if (index !== -1) {
          this.completedTasks.splice(index, 1);
        }
      } catch (error) {
        console.error('Failed to remove completed task:', error);
      }
    },
  },
});
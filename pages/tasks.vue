<template>
  <div class="trader-buttons">
    <TraderButton
      v-for="trader in tradersWithTasks"
      :key="trader.id"
      :trader="trader"
      @filter="filterTasks"
      class="trader-button"
    />
    <button @click="filterTasks(null)" class="trader-button reset">
      <h5>Все торговцы</h5>
    </button>
  </div>
  <div class="search-and-interaction">
    <input
      type="text"
      v-model="searchTerm"
      placeholder="Поиск..."
      class="search-input"
    />
    <div class="task-interaction">
      <select
        v-on:change="funcSortBy($event.target.value)"
        class="custom-select"
      >
        <option
          v-for="option in selectOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <button @click="deleteProgress()" class="reset-progress-btn">
        Сбросить прогресс
      </button>
      <h3>
        Выполнено {{ funcCompletedTasks.length }}/{{ filteredTasks.length }}
      </h3>
    </div>
  </div>
  <div class="quest-card-list">
    <li
      v-for="task in filteredSortedTasks"
      :key="task.id"
      class="quest-card-item"
      @click="showModal(task)"
    >
      <TaskItem
        :task="task"
        :kappaRequired="task.kappaRequired"
        :isTaskCompleted="isTaskCompleted"
        :markTaskCompleted="markTaskCompleted"
        :completedTasks="completedTasks"
      />
    </li>
    <TaskModal
      v-if="selectedTask"
      :task="selectedTask"
      @close="hideModal"
      @complete="finishedTask"
      @remove="removeTask"
    />
  </div>
</template>

<script>
import { request, gql } from "graphql-request";
import axios from "axios";
import TraderButton from "@/components/TraderButton.vue";
import TaskItem from "@/components/TaskItem.vue";
import TaskModal from "@/components/TaskModal.vue";

export default {
  components: {
    TraderButton,
    TaskItem,
    TaskModal,
  },
  data() {
    return {
      tasks: [],
      traders: [],
      selectedTrader: null,
      completedTasks: [],
      sortBy: "none",
      selectedTask: null,
      searchTerm: "",
      selectOptions: [
        { label: "По умолчанию", value: "none" },
        { label: "Не выполненные", value: "incomplete" },
        { label: "Выполненные", value: "completed" },
        { label: "Не нужно для каппы", value: "notKappa" },
        { label: "Нужно для каппы", value: "kappa" },
      ],
    };
  },
  computed: {
    filteredTasks() {
      if (!this.selectedTrader) return this.tasks;
      return this.tasks.filter(
        (task) => task.trader.id === this.selectedTrader
      );
    },
    filteredSortedTasks() {
      let sorted = [...this.filteredTasks];
      switch (this.sortBy) {
        case "kappa":
          sorted.sort((a, b) => b.kappaRequired - a.kappaRequired);
          break;
        case "notKappa":
          sorted.sort((a, b) => a.kappaRequired - b.kappaRequired);
          break;
        case "completed":
          sorted = sorted.filter((task) => this.isTaskCompleted(task.id));
          break;
        case "incomplete":
          sorted = sorted.filter((task) => !this.isTaskCompleted(task.id));
          break;
      }
      return sorted.filter((task) =>
        task.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    funcCompletedTasks() {
      return this.filteredTasks.filter((task) => this.isTaskCompleted(task.id));
    },
    tradersWithTasks() {
      return this.traders.filter((trader) =>
        this.tasks.some((task) => task.trader.id === trader.id)
      );
    },
  },
  async mounted() {
    await this.fetchTasks();
    await this.fetchCompletedTasks();
  },
  methods: {
    async fetchTasks() {
      const query = gql`
        {
          tasks(lang: ru) {
            id
            name
            experience
            minPlayerLevel
            kappaRequired
            taskImageLink
            trader {
              id
              name
            }
            taskRequirements {
              task {
                id
                name
              }
            }
            objectives {
              id
              optional
              description
              type
            }
          }
          traders(lang: ru) {
            id
            name
            imageLink
          }
        }
      `;

      const data = await request("https://api.tarkov.dev/graphql", query);
      this.tasks = data.tasks;
      this.traders = data.traders;
    },
    async fetchCompletedTasks() {
      try {
        const response = await axios.get("/api/completed-tasks");
        this.completedTasks = response.data;
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      }
    },
    isTaskCompleted(taskId) {
      return this.completedTasks.includes(taskId);
    },
    async markTaskCompleted(taskId) {
      if (!this.completedTasks.includes(taskId)) {
        try {
          await axios.post("/api/complete-task", { taskId });
          this.completedTasks.push(taskId);
        } catch (error) {
          console.error("Error marking task as completed:", error);
        }
      }
    },
    filterTasks(traderId) {
      this.selectedTrader = traderId;
    },
    funcSortBy(value) {
      this.sortBy = value;
    },
    showModal(task) {
      this.selectedTask = task;
    },
    hideModal() {
      this.selectedTask = null;
    },
    async finishedTask(taskId) {
      if (!this.completedTasks.includes(taskId)) {
        try {
          await axios.post("/api/complete-task", { taskId });
          this.completedTasks.push(taskId);
        } catch (error) {
          console.error("Error finishing task:", error);
        }
      }
    },
    async removeTask(taskId) {
      const index = this.completedTasks.indexOf(taskId);
      if (index !== -1) {
        try {
          await axios.post("/api/remove-completed-task", { taskId });
          this.completedTasks.splice(index, 1);
        } catch (error) {
          console.error("Error removing completed task:", error);
        }
      }
    },
    async deleteProgress() {
      try {
        await axios.post("/api/reset-progress");
        this.completedTasks = [];
      } catch (error) {
        console.error("Error resetting progress:", error);
      }
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f4f8;
  color: #333;
}

.trader-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  padding: 20px;
}

h3 {
  color: white;
  margin-top: 25px;
}

.trader-button {
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.trader-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.trader-button.reset {
  background: #ff6b6b;
  color: white;
}

.reset-progress-btn {
  margin-left: 15px;
}

.search-and-interaction {
  display: flex;
  justify-content: space-around;
  padding: 20px;
}

.search-input {
  width: 300px;
  height: 50px;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #0056b3;
}

.custom-select {
  width: 200px;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #ccc;
  appearance: none;

  cursor: pointer;
}

.custom-select:hover {
  border-color: #888;
}

.reset-progress-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.reset-progress-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.quest-card-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  list-style: none;
  padding: 0;
  margin: 20px auto;
}

.quest-card-item {
  width: 300px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.quest-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .quest-card-item {
    width: calc(50% - 20px);
  }
}

@media (max-width: 480px) {
  .quest-card-item {
    width: calc(100% - 20px);
  }
}
</style>

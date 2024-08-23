<template>
  <div
    class="quest-card"
    :style="{
      backgroundColor: isTaskCompleted(task.id) ? 'lightgreen' : 'white',
    }"
  >
    <div
      class="quest-image"
      :style="{ backgroundImage: 'url(' + task.taskImageLink + ')' }"
    >
      <div v-if="task.kappaRequired" class="kappa-icon"></div>
    </div>
    <div class="quest-name">{{ task.name }}</div>
    <div class="quest-actions">
      <button
        @click="toggleTaskCompletion"
        @click.stop
        :class="['quest-button', { completed: isTaskCompleted(task.id) }]"
      >
        {{ isTaskCompleted(task.id) ? "Отменить" : "Выполнить" }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
    isTaskCompleted: {
      type: Function,
      required: true,
    },
    markTaskCompleted: {
      type: Function,
      required: true,
    },
    completedTasks: {
      type: Array,
      required: true,
    },
  },
  methods: {
    async toggleTaskCompletion() {
      if (!this.isTaskCompleted(this.task.id)) {
        await this.markTaskCompleted(this.task.id);
      } else {
        this.$emit("remove", this.task.id);
      }
    },
  },
};
</script>

<style scoped>
.quest-card {
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.quest-image {
  width: 100%;
  height: 60%;
  background-size: cover;
}

.quest-image img {
  width: 100%;
  height: 100%;
}

.quest-name {
  margin-top: 10px;
  font-weight: bold;
  text-align: center;
  margin-top: 30px;
}

.quest-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.quest-button {
  padding: 5px 10px;
  background-color: #4caf50;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.quest-button.completed {
  background-color: #861d1d;
}

.kappa-icon {
  width: 40px;
  height: 40px;
  background-image: url("../assets/kappa.png");
  background-size: cover;
  margin-left: 10px;
}

.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>

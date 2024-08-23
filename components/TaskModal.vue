<template>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card class="modal-card">
        <v-btn icon dark @click="closeModal" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        
        <v-container fluid class="modal-content">
          <v-row>
            <v-col cols="12" md="6" class="task-image-container">
              <v-img :src="task.taskImageLink" max-height="400" contain class="task-image"></v-img>
              
              <div v-if="countableObjectives.length && counters.length" class="task-counters">
                <v-row>
                  <v-col v-for="(objective, index) in countableObjectives" :key="index" cols="12" sm="6" class="task-counter">
                    <div class="counter-image-container">
                      <v-img v-if="objective.items" :src="objective.items[0].iconLink" height="100" contain class="counter-image"></v-img>
                      <v-sheet v-else height="100" color="grey lighten-2" class="default-image">
                        No image
                      </v-sheet>
                    </div>
                    <div class="counter-description">
                      <span style="font-size: 15px">{{ objective.description }}</span>
                    </div>
                    <div class="counter-controls">
                      <v-btn @click="decrementCounter(index)" icon small><v-icon>mdi-minus</v-icon></v-btn>
                      <span>{{ counters[index] }} из {{ objective.count }}</span>
                      <v-btn @click="incrementCounter(index)" icon small><v-icon>mdi-plus</v-icon></v-btn>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-col>
  
            <v-col cols="12" md="6">
              <v-card-text class="task-details">
                <h2 class="task-name">{{ task.name }}</h2>
                <div class="task-info">
                  <div class="task-info-item">
                    <strong>Опыт:</strong> <span>{{ task.experience }}</span>
                  </div>
                  <div class="task-info-item">
                    <strong>Минимальный уровень игрока:</strong> <span>{{ task.minPlayerLevel }}</span>
                  </div>
                  <div class="task-info-item">
                    <strong>Требуется для Kappa:</strong> <span>{{ task.kappaRequired ? 'Да' : 'Нет' }}</span>
                  </div>
                  <div class="task-info-item">
                    <strong>Торговец:</strong> <span>{{ task.trader.name }}</span>
                  </div>
                </div>
  
                <div v-if="task.taskRequirements.length" class="task-requirements">
                  <div class="task-info-item">
                    <strong>Требуемые задачи:</strong>
                    <ul>
                      <li v-for="requirement in task.taskRequirements" :key="requirement.task.id">
                        {{ requirement.task.name }}
                      </li>
                    </ul>
                  </div>
                </div>
  
                <div v-if="task.objectives.length" class="task-objectives">
                  <div class="task-info-item">
                    <strong>Цели задачи:</strong>
                    <div v-for="(objective, index) in task.objectives" :key="index">
                      <div>
                        <v-icon @click="toggleObjectiveStatus(index)">{{ objective.completed ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}</v-icon>
                        {{ objective.description || 'Описание отсутствует' }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import { useUserStore } from '@/store/userStore';
  import { storeToRefs } from 'pinia';
  
  export default {
    props: {
      task: {
        type: Object,
        required: true
      }
    },
    setup() {
      const userStore = useUserStore();
      const { user } = storeToRefs(userStore);
  
      return { userStore, user };
    },
    data() {
      return {
        dialog: true,
        counters: [],
      };
    },
    computed: {
      countableObjectives() {
        return this.task && Array.isArray(this.task.objectives)
          ? this.task.objectives.filter(objective => objective.count && objective.type !== 'findItem')
          : [];
      }
    },
    mounted() {
      this.initializeCounters();
      this.loadUserData();
    },
    methods: {
      closeModal() {
        this.dialog = false;
        this.$emit('close');
      },
      initializeCounters() {
        if (this.countableObjectives.length > 0) {
          this.counters = this.countableObjectives.map(() => 0);
        } else {
          this.counters = [];
        }
      },
      toggleObjectiveStatus(index) {
        const objective = this.task.objectives[index];
        objective.completed = !objective.completed;
        this.userStore.saveObjectiveStatusToDatabase({ 
          taskId: this.task.id, 
          objectiveId: objective.id, 
          completed: objective.completed 
        });
        this.checkTaskCompletion();
      },
      incrementCounter(index) {
        if (this.counters[index] < this.countableObjectives[index].count) {
          this.counters[index]++;
          this.userStore.saveCounterToDatabase({ 
            taskId: this.task.id, 
            objectiveId: this.countableObjectives[index].id, 
            count: this.counters[index] 
          });
          this.checkTaskCompletion();
        }
      },
      decrementCounter(index) {
        if (this.counters[index] > 0) {
          this.counters[index]--;
          this.userStore.saveCounterToDatabase({ 
            taskId: this.task.id, 
            objectiveId: this.countableObjectives[index].id, 
            count: this.counters[index] 
          });
          this.checkTaskCompletion();
        }
      },
      loadUserData() {
        if (this.user) {
          this.userStore.loadUserDataFromDatabase(this.user.id);
        }
      },
      checkTaskCompletion() {
        const objectivesCompleted = this.task.objectives.every(objective => objective.completed);
        const countersMatch = this.counters.every((count, index) => count === this.countableObjectives[index].count);
  
        if (objectivesCompleted && countersMatch) {
          this.userStore.addToCompletedTasks(this.task.id);
        } else {
          this.userStore.removeFromCompletedTasks(this.task.id);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    max-height: 100vh;
    overflow-y: auto;
    position: relative;
  }
  
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: #333;
    transition: color 0.3s ease;
  }
  
  .close-btn:hover {
    color: #ff0000;
  }
  
  .modal-content {
    padding: 20px;
    display: flex;
    flex-direction: row;
  }
  
  .task-image-container {
    flex: 0 0 40%;
    margin-right: 20px;
  }
  
  .task-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  .task-counters {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    flex-wrap: wrap;
    max-height: 500px;
    overflow-y: auto;
  }
  
  .task-counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    width: 50%;
  }
  
  .counter-image-container {
    width: 100%;
    height: 100%;
  }
  
  .counter-image {
    border-radius: 8px;
    object-fit: cover;
  }
  
  .default-image {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
  }
  
  .counter-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .task-details {
    flex: 1;
  }
  
  .task-name {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .task-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .task-info-item {
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .task-requirements, 
  .task-objectives {
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    .modal-content {
      flex-direction: column;
    }
  
    .task-image-container {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }
  </style>
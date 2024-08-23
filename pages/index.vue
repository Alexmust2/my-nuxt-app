<template>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="auth-card">
            <v-card-title class="text-center text-h4 font-weight-bold mb-6">
              {{ isLogin ? 'Авторизация' : 'Регистрация' }}
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="submitForm" v-model="valid">
                <v-text-field
                  v-model="username"
                  :rules="[v => !!v || 'Логин обязателен']"
                  label="Логин"
                  prepend-inner-icon="mdi-account"
                  outlined
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  label="Пароль"
                  prepend-inner-icon="mdi-lock"
                  :type="showPassword ? 'text' : 'password'"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  outlined
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-if="!isLogin"
                  v-model="confirmPassword"
                  :rules="confirmPasswordRules"
                  label="Подтвердите пароль"
                  prepend-inner-icon="mdi-lock-check"
                  :type="showPassword ? 'text' : 'password'"
                  outlined
                  class="mb-6"
                ></v-text-field>
                <v-btn
                  color="primary"
                  block
                  x-large
                  :loading="loading"
                  :disabled="!valid"
                  @click="submitForm"
                  class="mb-4"
                >
                  {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
                </v-btn>
                <v-btn text color="primary" block @click="toggleAuthMode" class="mb-2">
                  {{ isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт? Войти' }}
                </v-btn>
                <v-btn v-if="isLogin" text color="primary" block @click="forgotPassword">
                  Забыли пароль?
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" bottom>
        {{ snackbarText }}
      </v-snackbar>
    </v-container>
  </template>
  
  <script>
  import { defineComponent } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios";
  
  export default defineComponent({
    name: "AuthPage",
    setup() {
      const router = useRouter();
      return { router };
    },
    data() {
      return {
        isLogin: true,
        username: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        valid: false,
        loading: false,
        snackbar: false,
        snackbarText: "",
        snackbarColor: "success",
      };
    },
    computed: {
      passwordRules() {
        const rules = [
          v => !!v || 'Пароль обязателен',
          v => (v && v.length >= 6) || 'Пароль должен быть не менее 6 символов',
        ];
        if (!this.isLogin) {
          rules.push(v => /[A-Z]/.test(v) || 'Пароль должен содержать хотя бы одну заглавную букву');
          rules.push(v => /\d/.test(v) || 'Пароль должен содержать хотя бы одну цифру');
        }
        return rules;
      },
      confirmPasswordRules() {
        return [
          v => !!v || 'Подтверждение пароля обязательно',
          v => v === this.password || 'Пароли не совпадают',
        ];
      },
    },
    mounted() {
      this.checkAuthStatus();
    },
    methods: {
      toggleAuthMode() {
        this.isLogin = !this.isLogin;
        this.username = "";
        this.password = "";
        this.confirmPassword = "";
      },
      async submitForm() {
        if (!this.valid) return;
        this.loading = true;
        if (this.isLogin) {
          await this.login();
        } else {
          await this.register();
        }
        this.loading = false;
      },
      async login() {
        try {
          const response = await axios.post("/api/login", {
            name: this.username,
            password: this.password,
          });
  
          if (response.data.success) {
            this.saveAuthStatus(this.username);
            this.showSnackbar("Успешная авторизация", "success");
            this.router.push("/test");
          } else {
            this.showSnackbar("Неверные учетные данные", "error");
          }
        } catch (error) {
          this.showSnackbar("Ошибка авторизации", "error");
        }
      },
      async register() {
        if (this.password !== this.confirmPassword) {
          this.showSnackbar("Пароли не совпадают", "error");
          return;
        }
        try {
          const response = await axios.post("/api/register", {
            name: this.username,
            password: this.password,
          });
  
          if (response.data.success) {
            this.saveAuthStatus(this.username);
            this.showSnackbar("Регистрация успешна", "success");
            this.router.push("/test");
          } else {
            this.showSnackbar("Ошибка при регистрации", "error");
          }
        } catch (error) {
          this.showSnackbar("Ошибка регистрации", "error");
        }
      },
      saveAuthStatus(username) {
        localStorage.setItem("isAuth", "true");
        localStorage.setItem("authUser", username);
      },
      checkAuthStatus() {
        const isAuth = localStorage.getItem("isAuth");
        const authUser = localStorage.getItem("authUser");
        if (isAuth === "true" && authUser) {
          this.router.push("/test");
        }
      },
      showSnackbar(text, color) {
        this.snackbarText = text;
        this.snackbarColor = color;
        this.snackbar = true;
      },
      forgotPassword() {
        this.showSnackbar("Функция восстановления пароля в разработке", "info");
      },
    },
  });
  </script>
  
  <style scoped>
  .auth-card {
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 2rem;
  }
  </style>
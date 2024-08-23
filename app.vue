<template>
  <v-app>
    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'

onMounted(() => {
  const theme = useTheme()
  theme.global.name.value = 'dark'
})
</script>
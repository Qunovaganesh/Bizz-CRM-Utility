<template>
  <v-snackbar v-model="toast.show" :color="toast.color" :timeout="toast.timeout" location="top right">
    <div class="d-flex align-items-center">
      <v-icon dark large class="mr-2">{{ toast.icon }}</v-icon>
      <strong class="ml-2">{{ toast.message }}</strong>
    </div>
  </v-snackbar>
</template>

<style scoped>
.custom-snackbar {
  /* Add custom styles here */
  padding-right: 4rem;
  /* Adjust the padding as needed */
  z-index: 1000;
}
</style>

<script setup>
import { ref, onMounted } from 'vue';
import eventBus from '../../eventBus';

const toast = ref({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
  icon: ''
});

onMounted(() => {
  // Listen for 'show-toast' events
  eventBus.value.$on('show-toast', (message, color, icon, timeout) => {
    toast.value.message = message;
    toast.value.color = color;
    toast.value.timeout = timeout;
    toast.value.icon = icon;
    toast.value.show = true;

    setTimeout(() => {
      toast.value.show = false;
    }, timeout);
  });
});
</script>
<template>
  <div class="h-full flex justify-center items-center">
    <div class="w-500 max-w-full text-center space-y-3">
      <img src="@/assets/images/404.png" alt="" class="mx-auto">
      <h2 class="text-4xl font-bold">Page Not Found</h2>
      <a-button type="primary" @click="router.push('/')">Back to home</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter();
</script>

<style scoped>

</style>
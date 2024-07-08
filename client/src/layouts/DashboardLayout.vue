<template>
  <div class="flex h-screen bg-gray-50 font-roboto">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div class="container max-w-full w-full max-h-full h-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
</script>

<template>
  <component :is="layout">
    <!-- eslint-disable-next-line -->
    <loading v-model:active="isLoading" :is-full-page="true" :opacity="0.3" color="#6366F1" loader="dots" :height="60" />
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Loading from 'vue3-loading-overlay'
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css'

const defaultLayout = 'default'
const store = useStore()
const router = useRouter()
const isLoading = computed(() => {
  return store.state.isLoading
})

const layout = computed(() => {
  return `${router.currentRoute.value.meta.layout || defaultLayout}-layout`
})
</script>

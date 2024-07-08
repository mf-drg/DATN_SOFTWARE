<template>
  <header class="grid grid-cols-3 justify-between px-6 py-2 border-b-4 bg-gray-50 border-indigo-500">
    <div class="flex items-center col-span-1">
      <button @click="openSidebar" class="text-gray-500 focus:outline-none lg:hidden">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div class="flex items-center justify-self-center">
      <!-- <h3 class="text-2xl font-medium text-gray-700 text-center">{{ routerName }}</h3>-->
    </div>

    <div class="flex items-center justify-self-end">
      <div class="relative">
        <button @click="dropdownOpen = !dropdownOpen" class="relative z-10 block w-8 h-8 overflow-hidden rounded-full shadow focus:outline-none">
          <img
            class="object-cover w-full h-full"
            src="https://images.unsplash.com/photo-1528892952291-009c663ce843?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=296&q=80"
            alt="Your avatar" />
        </button>

        <div v-show="dropdownOpen" @click="dropdownOpen = false" class="fixed inset-0 z-10 w-full h-full"></div>

        <transition
          enter-active-class="transition duration-150 ease-out transform"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in transform"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0">
          <div v-show="dropdownOpen" class="absolute right-0 z-20 w-48 py-2 mt-2 bg-gray-50 rounded-md shadow-2xl">
            <a class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white">{{ `Hi ${currentUser.userName}` }}</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white" @click.prevent="logout">Log out</a>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const dropdownOpen = ref(false)
const store = useStore()
const router = useRouter()
const currentUser = computed(() => {
  return store.state.user || {}
})
function openSidebar() {
  store.dispatch('openSidebar')
}
function logout() {
  store.dispatch('logout')
  router.push('/login')
}
</script>

<template>
  <div class="flex">
    <div :class="isOpen ? 'block' : 'hidden'" @click="closeSidebar" class="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"></div>
    <div
      :class="isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'"
      class="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-gray-900 lg:translate-x-0 lg:static lg:inset-0">
      <div class="flex items-center justify-center mt-8">
        <div class="flex items-center">
          <img src="/favicon.png" alt="Iot project" width="30" height="30" />
          <span class="mx-2 text-2xl font-bold text-white">HUST</span>
        </div>
      </div>

      <nav class="mt-10">
        <router-link
          @click="closeSidebar"
          class="flex items-center px-6 py-3 mt-4 duration-200"
          :class="[$route.name === 'Dashboard' ? activeClass : inactiveClass]"
          to="/dashboard">
          <ChartPieIcon class="w-5 h-5" />
          <span class="mx-4">Dashboard</span>
        </router-link>

        <router-link
          @click="closeSidebar"
          class="flex items-center px-6 py-3 mt-4 duration-200 cursor-pointer"
          :class="[$route.name === 'Device' ? activeClass : inactiveClass]"
          to="/devices">
          <CpuChipIcon class="w-5 h-5" />
          <span class="mx-4">Quản lý thiết bị</span>
        </router-link>
        <router-link
          v-if="loginUserRole === EUserRole.ROOT"
          @click="closeSidebar"
          class="flex items-center px-6 py-3 mt-4 duration-200 cursor-pointer"
          :class="[$route.name === 'User' ? activeClass : inactiveClass]"
          to="/users">
          <UserGroupIcon class="w-5 h-5" />
          <span class="mx-4">Quản lý người dùng</span>
        </router-link>
        <router-link
          @click="closeSidebar"
          class="flex items-center px-6 py-3 mt-4 duration-200 cursor-pointer"
          :class="[$route.name === 'Setting' ? activeClass : inactiveClass]"
          to="/setting">
          <Cog8ToothIcon class="w-5 h-5" />
          <span class="mx-4">Cài đặt</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { ChartPieIcon, CpuChipIcon, UserGroupIcon, Cog8ToothIcon } from '@heroicons/vue/24/solid'
import { EUserRole } from '../enums'

const store = useStore()
const activeClass = ref('bg-indigo-500 text-white')
const inactiveClass = ref('border-gray-900 text-gray-500 hover:bg-gray-600 hover:bg-opacity-25 hover:text-gray-100')

const isOpen = computed(() => {
  return store.state.isOpenSidebar
})

const loginUserRole = computed(() => {
  const loginUser = store.state.user
  if (loginUser) return loginUser.role
  return EUserRole.NORMAL
})
function closeSidebar() {
  store.dispatch('closeSidebar')
}
</script>

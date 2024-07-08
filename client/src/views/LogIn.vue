<template>
  <div class="flex items-center justify-center h-screen px-6 bg-gray-50">
    <div class="w-full max-w-sm p-6 bg-white rounded-md shadow-md">
      <div class="flex items-center justify-center mb-3">
        <img class="border-4 border-white h-18" src="/favicon.png" alt="log" />
      </div>
      <div class="flex items-center justify-center">
        <span class="text-3xl font-semibold text-indigo-600">Đăng nhập</span>
      </div>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
          <InputText id="email" v-model="formData.email" size="small" />
          <small v-if="errors.email" class="text-xs text-red-500">{{ errors.email[0].message }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
          <InputText id="password" v-model="formData.password" size="small" type="password" />
          <small v-if="errors.password" class="text-xs text-red-500">{{ errors.password[0].message }}</small>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="login"
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-2 text-sm text-center text-white bg-indigo-600 rounded-md focus:outline-none hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
          Sign in
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import InputText from 'primevue/inputtext'
import AuthService from '../services/AuthService'
import { useValidator } from '../composables/useValidator'

const store = useStore()
const router = useRouter()
const toast = useToast()
const axios = inject('axios')

const errors = ref({})
const isLoading = ref(false)
const formData = ref({
  email: '',
  password: '',
})
const schema = ref({
  email: {
    required: true,
    type: 'email',
    message: 'Vui lòng nhập email',
  },
  password: [
    {
      required: true,
      message: 'Vui lòng nhập password',
    },
    { min: 6, message: 'Vui lòng nhập password từ 6 ký tự' },
  ],
})
const user = computed(function () {
  return store.state.user
})
function login() {
  errors.value = {}
  useValidator(schema.value)
    .validate(formData.value)
    .then(async (data) => {
      store.dispatch('startLoading')
      try {
        const response = await AuthService.login(axios, data)
        if (response) {
          store.dispatch('login', response)
        }
      } catch (err) {
        toast.error('Email hoặc mật khẩu không đúng', { timeout: 5000 })
      } finally {
        store.dispatch('stopLoading')
      }
    })
    .catch(({ fields }) => {
      errors.value = fields
      store.dispatch('stopLoading')
    })
}

watch(user, function (value) {
  if (value) {
    router.push('/dashboard')
  }
})
</script>
<style scoped>
.link-center {
  margin-top: 1em;
  width: 100%;
  text-align: center;
}
</style>

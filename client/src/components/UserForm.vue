<template>
  <form class="flex flex-col justify-between md:pb-10 text-gray-700 dark:text-gray-200" @submit.prevent="onSubmit">
    <div class="flex w-full flex-wrap py-2">
      <div class="w-full flex flex-col gap-y-5 mb-4">
        <div class="flex flex-col gap-2">
          <label for="userName" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
          <InputText id="userName" v-model="props.data.userName" size="small" />
          <small v-if="props.errors.userName" class="text-xs text-red-500">{{ props.errors.userName[0].message }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
          <InputText id="email" v-model="props.data.email" size="small" />
          <small v-if="props.errors.email" class="text-xs text-red-500">{{ props.errors.email[0].message }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
          <InputText id="password" v-model="props.data.password" size="small" type="password"/>
          <small v-if="props.errors.password" class="text-xs text-red-500">{{ props.errors.password[0].message }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label for="role" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Role</label>
          <Dropdown
            inputId="role"
            v-model="roleType"
            :options="roles"
            optionLabel="name"
            placeholder="Chọn..."
            class="min-w-36"
            panelClass="text-sm"
            inputClass="!p-2" />
          <small v-if="props.errors.role" class="text-xs text-red-500">{{ props.errors.role[0].message }}</small>
        </div>
      </div>
    </div>
  </form>
</template>
<script setup>
import { computed, defineProps, ref } from 'vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { EUserRole } from '../enums'

const props = defineProps({
  data: { type: Object, required: true },
  errors: { type: Object, required: false, default: {} },
  action: { type: String, required: false, default: 'update' },
})

const roles = ref([
  { name: 'Normal', code: EUserRole.NORMAL },
  { name: 'Admin', code: EUserRole.ADMIN },
])

const roleType = computed({
  get() {
    return roles.value.find((el) => el.code === props.data.role)
  },
  set(newValue) {
    props.data.role = newValue.code
  },
})

</script>

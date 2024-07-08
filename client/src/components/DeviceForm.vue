<template>
  <form class="flex flex-col justify-between md:pb-10 text-gray-700 dark:text-gray-200" @submit.prevent="onSubmit">
    <div class="flex w-full flex-wrap py-2">
      <div class="w-full flex flex-col gap-y-5 mb-4">
        <div class="flex flex-col gap-2">
          <label for="hardwareId" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Mã phần cứng</label>
          <InputText id="hardwareId" v-model="props.data.hardwareId" size="small" :disabled="props.action === 'update'" />
          <small v-if="props.errors.hardwareId" class="text-xs text-red-500">{{ props.errors.hardwareId[0].message }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Tên</label>
          <InputText id="name" v-model="props.data.name" size="small" />
          <small v-if="props.errors.name" class="text-xs text-red-500">{{ props.errors.name[0].message }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label for="type" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Loại</label>
          <Dropdown
            inputId="type"
            v-model="dataType"
            :options="types"
            :disabled="props.action === 'update'"
            optionLabel="name"
            placeholder="Chọn loại..."
            class="min-w-36"
            panelClass="text-sm"
            inputClass="!p-2" />
          <small v-if="props.errors.type" class="text-xs text-red-500">{{ props.errors.type[0].message }}</small>
        </div>
        <div v-if="props.data.type === EDeviceType.LIGHT" class="flex flex-col gap-2">
          <label for="gatewayId" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Gateway</label>
          <Dropdown
            inputId="gatewayId"
            v-model="dataGateway"
            :options="gatewayOptions"
            optionLabel="name"
            placeholder="Chọn gateway..."
            class="min-w-36"
            panelClass="text-sm"
            inputClass="!p-2" />
          <small v-if="props.errors.gatewayId" class="text-xs text-red-500">{{ props.errors.gatewayId[0].message }}</small>
        </div>
      </div>
    </div>
  </form>
</template>
<script setup>
import { computed, defineProps, ref } from 'vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { EDeviceType } from '../enums'

const props = defineProps({
  data: { type: Object, required: true },
  errors: { type: Object, required: false, default: {} },
  gateways: { type: Array, required: false, default: [] },
  action: { type: String, required: false, default: 'update' },
})

const types = ref([
  { name: 'Gateway', code: EDeviceType.GATEWAY },
  { name: 'Light', code: EDeviceType.LIGHT },
])

const gatewayOptions = computed(() => {
  return props.gateways.filter((el) => el.code !== props.data.id)
})

const dataType = computed({
  get() {
    return types.value.find((el) => el.code === props.data.type)
  },
  set(newValue) {
    props.data.type = newValue.code
  },
})
const dataGateway = computed({
  get() {
    return gatewayOptions.value.find((el) => el.code === props.data.gatewayId)
  },
  set(newValue) {
    props.data.gatewayId = newValue.code
  },
})
</script>

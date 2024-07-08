<template>
  <div class="flex flex-wrap xl:mx-0 p-5 min-h-full h-full text-gray-700 dark:text-gray-300">
    <div class="w-full p-5 md:px-8 md:py-5 bg-white text-gray-600">
      <div class="w-full">
        <h1 class="text-lg sm:text-xl font-semibold">Danh sách thiết bị</h1>
      </div>
      <div class="w-full h-full mt-5">
        <div class="w-full">
          <div class="w-full flex justify-between py-3">
            <div class="flex">
              <Button v-if="loginUserRole === EUserRole.ROOT" label="Thêm mới" size="small" raised @click="onOpenCreateSetting" />
            </div>
            <InputGroup class="w-full md:max-w-64 text-sm">
              <InputText v-model="query.keyword" placeholder="Tìm kiếm" size="small" />
              <Button size="small" severity="secondary" @click="fetchData"><MagnifyingGlassIcon class="w-4 h-4"></MagnifyingGlassIcon></Button>
            </InputGroup>
          </div>
          <DataTable :value="data" class="text-sm" tableStyle="min-width: 50rem">
            <Column field="index" header="#"></Column>
            <Column field="name" header="Tên thiết bị"></Column>
            <Column field="hardwareId" header="Mã phần cứng"></Column>
            <Column header="Loại">
              <template #body="slotProps">
                <Tag :value="slotProps.data.typeName" severity="primary" />
              </template>
            </Column>
            <Column header="Trạng thái">
              <template #body="slotProps">
                <div class="w-full flex justify-start pl-5">
                  <span class="relative flex h-4 w-4">
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      :class="[slotProps.data.property.state === 1 ? 'bg-green-500' : 'bg-red-500']"></span>
                    <span
                      class="relative inline-flex w-4 h-4 rounded-full"
                      :class="[slotProps.data.property.state === 1 ? 'bg-green-500' : 'bg-red-500']"></span>
                  </span>
                </div>
              </template>
            </Column>
            <Column header="Trạng thái điều khiển">
              <template #body="slotProps">
                <div class="w-full flex justify-start pl-5">
                  <ToggleSwitch v-model="slotProps.data.property.controlState" @onChange="(state) => onToggleState(slotProps.data.id, state)" />
                </div>
              </template>
            </Column>
            <Column header="Ngày tạo"
              ><template #body="slotProps">
                <p class="text-sm">{{ slotProps.data.createdAt }}</p>
              </template></Column
            >
            <Column header="Hành động" class="flex justify-center">
              <template #body="slotProps">
                <div class="flex flex-wrap justify-start gap-x-2">
                  <Button @click="onOpenSetting(slotProps.data)" text rounded size="small" class="text-indigo-500">
                    <template #icon>
                      <Cog8ToothIcon class="w-5 h-5"></Cog8ToothIcon>
                    </template>
                  </Button>
                </div>
              </template>
            </Column>
          </DataTable>

          <Paginator
            :rows="query.limit"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[10, 20, 30]"
            @page="onChangePage"
            template="CurrentPageReport  FirstPageLink PrevPageLink PageLinks  NextPageLink LastPageLink"
            currentPageReportTemplate="Tổng {totalRecords}"
            class="pt-5 flex justify-end text-xs [&_button]:h-8 [&_button]:w-8 [&_button]:min-w-1 [&_button]:rounded-lg"></Paginator>
        </div>

        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="w-full"></div>
          <div class="w-full"></div>
        </div>
      </div>
    </div>
  </div>
  <Sidebar
    v-model:visible="openRightBar"
    position="right"
    class="w-full md:w-[450px]"
    :pt="{ mask: 'transition-all duration-300 has-[.mask-active]:bg-transparent bg-black/40 has-[.mask-active]:backdrop-blur-none' }">
    <template #header>
      <div class="flex align-items-center gap-2">
        <span class="font-bold">Quản lý thiết bị</span>
      </div>
    </template>
    <div class="flex flex-col w-full h-full text-sm">
      <TabView v-model:activeIndex="activeTab" @tab-change="onTabChange" class="w-full flex-grow mb-5">
        <TabPanel v-if="action === 'create'" header="Thêm thiết bị">
          <DeviceForm :data="createDataForm" :gateways="gatewayDevices" :errors="dataFormErrors" :action="action"></DeviceForm>
          <div clss="w-full flex">
            <div class="mt-5">
              <Button
                v-if="loginUserRole === EUserRole.ROOT || devicePermission >= EPermission.EDIT"
                label="Lưu lại"
                size="small"
                raised
                @click="submitAction" />
            </div>
          </div>
        </TabPanel>
        <template v-else>
          <TabPanel header="Thuộc tính">
            <DeviceForm :data="currentActionRows" :gateways="gatewayDevices" :errors="dataFormErrors" :action="action"></DeviceForm>
            <div clss="w-full flex">
              <div class="mt-5">
                <Button
                  v-if="loginUserRole === EUserRole.ROOT || devicePermission >= EPermission.EDIT"
                  label="Lưu lại"
                  size="small"
                  raised
                  @click="submitAction" />
              </div>
            </div>
            <div class="w-full mt-10" v-if="loginUserRole === EUserRole.ROOT || devicePermission >= EPermission.EDIT">
              <Divider />
              <p class="text-xs text-gray-500 mb-3 italic">
                Xóa thiết bị là hành động không thể hoàn tác. Không thể xóa các thiết bị GATEWAY có chứa SUBDEVICE.
              </p>
              <Button label="Xóa thiết bị" size="small" severity="danger" raised @click="deleteOneDevice" />
            </div>
          </TabPanel>
          <TabPanel header="Điều khiển">
            <div class="w-full flex gap-x-2">
              <Button label="PowerOn" raised size="small" @click="onClickTurnOn" />
              <Button label="PowerOff" severity="danger" raised size="small" @click="onClickTurnOff" />
            </div>
            <Divider />
            <div class="w-full flex-row gap-y-6 mt-8">
              <div class="w-full flex gap-x-6 items-center">
                <Slider v-model="currentActionRows.property.brightness" :min="0" :max="100" :step="1" class="!flex-1 !w-auto !rounded-lg" />
                <div class="">
                  <InputNumber
                    v-model="currentActionRows.property.brightness"
                    inputId="horizontal-buttons"
                    showButtons
                    buttonLayout="horizontal"
                    :step="1"
                    suffix=" %"
                    class="w-auto [&_button]:py-2 [&_button]:px-0 [&_button]:bg-gray-200 [&_button]:hover:bg-gray-200 [&_button]:text-gray-700 [&_input]:p-2 [&_input]:w-16">
                    <template #incrementbuttonicon>
                      <PlusIcon class="w-4 h-4" />
                    </template>
                    <template #decrementbuttonicon>
                      <MinusIcon class="w-4 h-4" />
                    </template>
                  </InputNumber>
                </div>
              </div>
              <Button
                v-if="loginUserRole === EUserRole.ROOT || devicePermission >= EPermission.EDIT"
                label="Dimming"
                size="small"
                raised
                @click="onClickSetDim" />
            </div>
            <div v-if="currentActionRows.type === EDeviceType.GATEWAY" class="w-full">
              <Divider />
              <div class="w-full mt-8">
                <p class="mb-2">Update schedule:</p>
                <button
                  @click="addSchedule"
                  type="button"
                  class="py-1 px-2 text-sm font-medium focus:outline-none bg-white rounded-t-lg border border-gray-200 hover:bg-gray-100 hover:text-primary focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                  Add Duration
                </button>
              </div>
              <div class="w-full flex flex-col gap-y-1 mb-3">
                <div v-for="(el, index) in currentSchedulesForm" class="flex gap-x-3 w-full p-4 rounded-lg border-gray-300 border">
                  <div class="flex flex-col">
                    <Calendar id="time" inputClass="!p-2" panelClass="!text-xs" v-model="el.time" timeOnly dateFormat="HH:mm" :stepMinute="5" />
                    <small v-if="scheduleFormErrors[index + '-time']" class="text-xs text-red-500">{{
                      scheduleFormErrors[index + '-time'][0].message
                    }}</small>
                  </div>
                  <div class="flex flex-col w-20">
                    <input
                      type="number"
                      :min="1"
                      :step="5"
                      id="offset"
                      v-model="el.duration"
                      class="border border-gray-300 text-sm rounded-md focus:ring-none focus:outline-none focus:outline-offset-0 px-2.5 py-1" />

                    <small v-if="scheduleFormErrors[index + '-duration']" class="text-xs text-red-500">{{
                      scheduleFormErrors[index + '-duration'][0].message
                    }}</small>
                  </div>
                  <button
                    type="button"
                    @click="deleteSchedule(index)"
                    class="w-full py-1 px-2 text-sm font-medium focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                    <XMarkIcon class="w-4 h-4"></XMarkIcon>
                  </button>
                </div>
              </div>
              <div class="w-full mb-3">
                <div class="flex items-center mb-5">
                  <div class="flex items-center h-5">
                    <input
                      id="dayByDay"
                      v-model="dayByDay"
                      type="checkbox"
                      value=""
                      class="w-4 h-4 border accent-primary border-gray-300 rounded-lg hover:bg-primary" />
                  </div>
                  <label for="dayByDay" class="ms-2 text-xs dark:text-gray-300">Day by day</label>
                </div>
                <p class="mb-3">Repeat on:</p>
                <div class="flex gap-x-3 w-full">
                  <div v-for="day in repeatOnOptions" class="flex items-center">
                    <div class="flex items-center h-5">
                      <input
                        :id="day.code"
                        name="repeatOn"
                        type="checkbox"
                        v-model="weekdays"
                        :value="day.code"
                        class="w-4 h-4 border accent-primary border-gray-300 rounded-lg hover:bg-primary" />
                    </div>
                    <label :for="day.code" class="ms-2 text-xs dark:text-gray-300">{{ day.name }}</label>
                  </div>
                </div>
                <small v-if="scheduleFormErrors['weekdays']" class="text-xs text-red-500">{{ scheduleFormErrors['weekdays'][0].message }}</small>
              </div>
              <div class="w-full pt-3">
                <Button label="Update schedule" size="small" raised @click="saveSchedule" />
              </div>
            </div> </TabPanel
        ></template>
      </TabView>
    </div>
  </Sidebar>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment-timezone'
import { cloneDeep, template, value } from 'lodash-es'
import { useToast } from 'vue-toastification'
import { Cog8ToothIcon, MagnifyingGlassIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Sidebar from 'primevue/sidebar'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Paginator from 'primevue/paginator'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import Divider from 'primevue/divider'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import {
  searchDevice,
  editDevice,
  addDevice,
  saveManySchedule,
  deleteOneSchedule,
  changeDeviceProperty,
  deleteDevice,
} from '../services/DeviceService.js'
import { EDeviceType, EPermission, EUserRole } from '../enums/index.js'
import { useQuery } from '../composables/useQuery.js'
import { useValidator } from '../composables/useValidator.js'
import DeviceForm from '../components/DeviceForm.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'

const store = useStore()
const toast = useToast()
const { query } = useQuery()
const axios = inject('axios')
const mqttClient = inject('mqttClient')

const dataFormErrors = ref({})
const scheduleFormErrors = ref({})
const openRightBar = ref(false)
const data = ref([])
const totalRecords = ref(0)
const gatewayDevices = ref([])
const currentActionRows = ref({})
const weekdays = ref([])
const createDataForm = ref({
  hardwareId: '',
  gatewayId: '',
  type: EDeviceType.LIGHT,
  name: '',
})
const currentSchedulesForm = ref([])

function addSchedule() {
  currentSchedulesForm.value.push({
    time: '18:30',
    duration: 30,
    weekdays: [],
  })
}

const activeTab = ref(0)
const action = ref('update')
const repeatOnOptions = ref([
  { name: 'T2', code: 0 },
  { name: 'T3', code: 1 },
  { name: 'T4', code: 2 },
  { name: 'T5', code: 3 },
  { name: 'T6', code: 4 },
  { name: 'T7', code: 5 },
  { name: 'CN', code: 6 },
])

const dayByDay = computed({
  get() {
    return weekdays.value.length === 7
  },
  set(value) {
    if (value) weekdays.value = [0, 1, 2, 3, 4, 5, 6]
    else weekdays.value = []
  },
})

function registerTopic() {
  if (mqttClient.connected) {
    mqttClient.subscribe('hust/+/report')
    mqttClient.subscribe('hust/+/cmd')
  }
}
async function onReceivedMessage(topic, message) {
  const payload = JSON.parse(message.toString())
  switch (true) {
    case /^hust\/[^\/]+\/report$/.test(topic): {
      const state = payload.STATUS === 'ON' ? 1 : 0
      data.value.forEach((el) => {
        if (el.hardwareId === payload.ID) {
          el.property.state = state
        }
      })
      break
    }
    case /^hust\/[^\/]+\/cmd$/.test(topic): {
      const match = topic.match(/^hust\/([^\/]+)\/cmd$/)
      const gatewayHardwareId = match[1]
      data.value.forEach((el) => {
        const isGatewayControl = payload.ID === 'ALL'
        if (
          el.hardwareId === payload.ID ||
          (isGatewayControl && (el.hardwareId === gatewayHardwareId || el.gatewayHardwareId === gatewayHardwareId))
        ) {
          const state = payload.STATE === 'ON' ? 1 : 0
          el.property.controlState = state
        }
      })
      break
    }
  }
}
const schedulesFormSchema = computed(() => {
  const schema = {
    weekdays: {
      require: true,
      type: 'array',
      min: 1,
      message: 'Vui là chọn ít nhất 1 ngày',
    },
  }
  currentSchedulesForm.value.forEach((el, index) => {
    schema[index + '-time'] = {
      required: true,
      type: 'string',
      message: 'Vui lòng nhập thời gian',
    }
    schema[index + '-duration'] = { required: true, type: 'number', message: 'Vui lòng nhập duration', min: 1 }
  })

  return schema
})
const dataFormSchema = computed(() => ({
  hardwareId: {
    required: true,
    type: 'string',
    message: 'Vui lòng hardware ID',
  },
  name: {
    required: true,
    type: 'string',
    message: 'Vui lòng nhập tên',
  },
  type: {
    required: action.value === 'create',
    type: 'number',
    message: 'Vui lòng chọn loại',
  },
  gatewayId: {
    required: isGatewayRequire.value,
    type: 'string',
    message: 'Vui lòng chọn gateway',
  },
}))
const submitAction = computed(() => {
  return action.value === 'update' ? updateDevice : createDevice
})

const devicePermission = computed(() => {
  const deviceId = currentActionRows.value.id
  const devicePermission = store.state.user.permissions[deviceId]
  return Number(devicePermission)
})

const loginUserRole = computed(() => {
  const loginUser = store.state.user
  if (loginUser) return loginUser.role
  return EUserRole.NORMAL
})

const isGatewayRequire = computed(() => {
  if (action.value === 'update') {
    currentActionRows.value.type !== EDeviceType.GATEWAY
  } else {
    createDataForm.value.type !== EDeviceType.GATEWAY
  }
})

onMounted(async () => {
  await fetchData()
  const gatewayDeviceResponse = await fetchDeviceGateway()
  gatewayDevices.value = gatewayDeviceResponse.map((el) => {
    return {
      name: `${el.hardwareId}`,
      code: el.id,
    }
  })
})

onMounted(() => {
  if (!mqttClient.connected) {
    mqttClient.on('connect', registerTopic)
  } else {
    registerTopic()
  }
  mqttClient.on('message', onReceivedMessage)
})

onUnmounted(() => {
  if (mqttClient.connected) {
    mqttClient.unsubscribe('hust/+/cmd')
    mqttClient.unsubscribe('hust/+/report')
    mqttClient.off('connect', registerTopic)
  }
  mqttClient.off('message', onReceivedMessage)
})
async function fetchData() {
  store.dispatch('startLoading')
  try {
    const response = await searchDevice(axios, query.value)
    if (!response.success) {
      toast.error(response.message, {
        timeout: 5000,
      })
    } else {
      totalRecords.value = response.meta.totalItems
      data.value = response.data.map((el, index) => {
        const typeName = Object.keys(EDeviceType).find((key) => EDeviceType[key] === el.type)
        const createdAt = moment(el.createdAt).tz('Asia/Ho_Chi_Minh').format('YYYY/MM/DD HH:mm:ss')

        return {
          ...el,
          typeName,
          createdAt,
          index: index + 1,
        }
      })
      query.value.limit = response.meta.limit
      query.value.page = response.meta.page
    }
  } catch {
  } finally {
    store.dispatch('stopLoading')
  }
}
async function fetchDeviceGateway() {
  const response = await searchDevice(axios, { limit: 1000, page: 1, type: EDeviceType.GATEWAY })
  if (!response.success) {
    return []
  }
  return response.data
}
function updateDevice() {
  dataFormErrors.value = {}
  useValidator(dataFormSchema.value)
    .validate(currentActionRows.value)
    .then(async (data) => {
      store.dispatch('startLoading')
      try {
        const { id } = currentActionRows.value
        const response = await editDevice(axios, id, data)
        if (!response.success) {
          toast.error(response.message, { timeout: 5000 })
          return
        }
        toast.success(response.message, { timeout: 5000 })
        await fetchData()
      } catch (err) {
        toast.error(err.response.data.message, { timeout: 5000 })
      } finally {
        store.dispatch('stopLoading')
      }
    })
    .catch(({ fields }) => {
      dataFormErrors.value = fields
      store.dispatch('stopLoading')
    })
}
function createDevice() {
  dataFormErrors.value = {}
  useValidator(dataFormSchema.value)
    .validate(createDataForm.value)
    .then(async (data) => {
      store.dispatch('startLoading')
      try {
        if (data.type === EDeviceType.GATEWAY) {
          delete data.gatewayId
        }
        const response = await addDevice(axios, data)
        if (!response.success) {
          toast.error(response.message, { timeout: 5000 })
          return
        }
        toast.success(response.message, { timeout: 5000 })
        createDataForm.value = {
          hardwareId: '',
          gatewayId: '',
          type: EDeviceType.LIGHT,
          name: '',
        }
        await fetchData()
      } catch (err) {
        toast.error(err.response.data.message, { timeout: 5000 })
      } finally {
        store.dispatch('stopLoading')
      }
    })
    .catch(({ fields }) => {
      console.log(fields)
      dataFormErrors.value = fields
      store.dispatch('stopLoading')
    })
}
function saveSchedule() {
  scheduleFormErrors.value = {}
  //format time
  currentSchedulesForm.value.forEach((el) => {
    if (el.time instanceof Date) {
      const time = moment(el.time).format('HH:mm')
      el.time = time
    }
  })
  const validateData = currentSchedulesForm.value.reduce((prev, curr, index) => {
    Object.assign(prev, { [index + '-time']: curr.time, [index + '-duration']: curr.duration })
    return prev
  }, {})
  validateData.weekdays = weekdays.value
  useValidator(schedulesFormSchema.value)
    .validate(validateData)
    .then(async (_) => {
      store.dispatch('startLoading')
      try {
        const { id } = currentActionRows.value
        const data = currentSchedulesForm.value.map((el) => {
          return {
            ...el,
            weekdays: weekdays.value,
          }
        })
        const response = await saveManySchedule(axios, id, { data })
        if (!response.success) {
          toast.error(response.message, { timeout: 5000 })
          return
        }
        toast.success(response.message, { timeout: 5000 })
        currentSchedulesForm.value = response.data
        await fetchData()
      } catch (err) {
        toast.error(err.response.data.message, { timeout: 5000 })
      } finally {
        store.dispatch('stopLoading')
      }
    })
    .catch(({ fields }) => {
      scheduleFormErrors.value = fields
      store.dispatch('stopLoading')
    })
}
async function deleteSchedule(index) {
  store.dispatch('startLoading')
  try {
    const schedule = currentSchedulesForm.value[index]
    const id = currentActionRows.value.id
    if (schedule.id) {
      const response = await deleteOneSchedule(axios, id, schedule.id)
      if (!response.success) {
        toast.error(response.message, { timeout: 5000 })
        return
      }
      toast.success(response.message, { timeout: 5000 })
      await fetchData()
      currentSchedulesForm.value.splice(index, 1)
    }
  } catch (err) {
    toast.error(err.response.data.message, { timeout: 5000 })
  } finally {
    store.dispatch('stopLoading')
  }
}
async function deleteOneDevice() {
  store.dispatch('startLoading')
  try {
    const id = currentActionRows.value.id
    const response = await deleteDevice(axios, id)
    if (!response.success) {
      toast.error(response.message, { timeout: 5000 })
      return
    }
    toast.success(response.message, { timeout: 5000 })
    currentActionRows.value = {}
    currentSchedulesForm.value = []
    weekdays.value = []
    activeTab.value = 0
    openRightBar.value = false
    await fetchData()
  } catch (err) {
    toast.error(err.response.data.message, { timeout: 5000 })
  } finally {
    store.dispatch('stopLoading')
  }
}
async function updateDeviceProperty(body, updateId) {
  store.dispatch('startLoading')
  try {
    let id = updateId
    if (!updateId) {
      id = currentActionRows.value.id
    }
    const response = await changeDeviceProperty(axios, id, body)
    if (!response.success) {
      toast.error(response.message, { timeout: 5000 })
      return
    }
    toast.success(response.message, { timeout: 5000 })
    await fetchData()
  } catch (err) {
    toast.error(err.response.data.message, { timeout: 5000 })
  } finally {
    store.dispatch('stopLoading')
  }
}

async function onClickTurnOn() {
  await updateDeviceProperty({ controlState: 1 })
}
async function onClickTurnOff() {
  await updateDeviceProperty({ controlState: 0 })
}
async function onToggleState(id, controlState) {
  await updateDeviceProperty({ controlState }, id)
}
async function onClickSetDim() {
  await updateDeviceProperty({ brightness: currentActionRows.value.property?.brightness })
}
async function onTabChange(tab) {
  const { index } = tab
  if (index === 1) {
  }
}
function onOpenCreateSetting() {
  activeTab.value = 0
  action.value = 'create'
  openRightBar.value = true
}
async function onOpenSetting(row) {
  currentActionRows.value = cloneDeep(row)
  currentSchedulesForm.value = cloneDeep(row.schedules)
  weekdays.value = cloneDeep(row.schedules[0]?.weekdays || [])
  activeTab.value = 0
  action.value = 'update'
  openRightBar.value = true
}
async function onChangePage(page) {
  query.value.page = page.page + 1
  await fetchData()
}
</script>

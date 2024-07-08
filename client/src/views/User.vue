<template>
  <div class="flex flex-wrap xl:mx-0 p-5 min-h-full h-full text-gray-700 dark:text-gray-300">
    <div class="w-full p-5 md:px-8 md:py-5 bg-white text-gray-600">
      <div class="w-full">
        <h1 class="text-lg sm:text-xl font-semibold">Danh sách người dùng</h1>
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
            <Column field="userName" header="Tên người dùng"></Column>
            <Column field="email" header="Email"></Column>
            <Column field="phoneNumber" header="Số điện thoại"></Column>
            <Column header="Role">
              <template #body="slotProps">
                <Tag :value="slotProps.data.displayRole" severity="success" />
              </template>
            </Column>
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
        <span class="font-bold">Quản lý người dùng</span>
      </div>
    </template>
    <div class="flex flex-col w-full h-full text-sm">
      <TabView v-model:activeIndex="activeTab" @tab-change="onTabChange" class="w-full flex-grow mb-5">
        <TabPanel v-if="action === 'create'" header="Thêm người dùng">
          <UserForm :data="createDataForm" :errors="dataFormErrors" :action="action"></UserForm>
          <div clss="w-full flex">
            <div class="mt-5">
              <Button v-if="loginUserRole === EUserRole.ROOT" label="Lưu lại" size="small" raised @click="submitAction" />
            </div>
          </div>
        </TabPanel>
        <template v-else>
          <TabPanel header="Thuộc tính">
            <UserForm :data="currentActionRows" :errors="dataFormErrors" :action="action"></UserForm>
            <div clss="w-full flex">
              <div class="mt-5">
                <Button v-if="loginUserRole === EUserRole.ROOT" label="Lưu lại" size="small" raised @click="submitAction" />
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Quyền hạn">
            <div class="w-full">
              <div class="flex flex-col gap-2">
                <label for="addRoles" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Thêm quyền</label>
                <div class="flex gap-x-2 text-sm">
                  <MultiSelect
                    id="addRoles"
                    v-model="permissionsForm.devices"
                    :options="devices"
                    filter
                    optionLabel="name"
                    placeholder="Chọn thiết bị"
                    :maxSelectedLabels="3"
                    class="flex-1"
                    panelClass="max-w-fit text-sm"
                    :pt="{
                      headerCheckbox: 'w-5 h-5 [&_div]:w-5 h-5',
                      labelContainer: 'overflow-hidden flex flex-auto cursor-pointer [&_div]:p-2',
                      filterInput:
                        'leading-[normal] m-0 px-2 py-2 rounded-md text-surface-800 dark:text-white/80 placeholder:text-surface-400 dark:placeholder:text-surface-500 bg-surface-0 dark:bg-surface-900 border border-surface-300 dark:border-surface-600 invalid:focus:ring-red-200 invalid:hover:border-red-500 hover:border-primary focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:z-10 appearance-none transition-colors duration-200',
                    }" />
                  <Dropdown
                    v-model="permissionsForm.permission"
                    :options="permissions"
                    optionLabel="name"
                    placeholder="Chọn..."
                    class="min-w-36"
                    panelClass="text-sm"
                    inputClass="!p-2" />
                </div>
                <div class="flex justify-end gap-x-2 text-sm">
                  <small v-if="permissionsFormErrors.devices" class="flex-1 text-xs text-red-500">{{
                    permissionsFormErrors.devices[0].message
                  }}</small>
                  <small v-if="permissionsFormErrors.permission" class="min-w-36 text-xs text-red-500">{{
                    permissionsFormErrors.permission[0].message
                  }}</small>
                </div>
                <small class="text-xs">{{ 'Notice: Có thể chọn nhiều thiết bị cùng lúc' }}</small>
                <div class="mt-5"><Button label="Lưu lại" size="small" raised @click="setPermission" /></div>
              </div>
              <div class="w-full mt-5">
                <h4 class="py-2 font-semibold">Thiết bị đã cấp quyền</h4>
                <DataTable :value="currentPermissions" scrollable scrollHeight="350px" class="text-xs">
                  <Column field="hardwareId" header="Thiết bị"></Column>
                  <Column header="Quyền">
                    <template #body="slotProps">
                      <Tag :value="permissions.find((el) => el.code === slotProps.data.permission).name" severity="warning" />
                    </template>
                  </Column>
                  <Column header="Hành động" class="flex justify-center">
                    <template #body="slotProps">
                      <div class="flex flex-wrap justify-start gap-x-2">
                        <Button text rounded size="small" severity="danger">
                          <template #icon>
                            <TrashIcon @click="deletePermission(slotProps.data.deviceId)" class="w-5 h-5"></TrashIcon>
                          </template>
                        </Button>
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div> </TabPanel
        ></template>
      </TabView>
      <div clss="w-full flex"></div>
    </div>
  </Sidebar>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { Cog8ToothIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/vue/24/solid'
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
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import { getUserPermission, setUserPermission, deleteUserPermission, searchUser, addUser, editUser } from '../services/UserService.js'
import { searchDevice } from '../services/DeviceService.js'
import { EPermission, EUserRole } from '../enums/index.js'
import { useQuery } from '../composables/useQuery.js'
import { useValidator } from '../composables/useValidator'
import UserForm from '../components/UserForm.vue'

const store = useStore()
const toast = useToast()
const { query } = useQuery()
const axios = inject('axios')
const action = ref('update')
const permissionsFormErrors = ref({})
const openRightBar = ref(false)
const data = ref([])
const totalRecords = ref(0)
const permissionsForm = ref({
  devices: [],
  permission: '',
})
const devices = ref()
const currentPermissions = ref([])
const currentActionRows = ref({})
const activeTab = ref(0)
const dataFormErrors = ref({})
const schema = ref({
  devices: {
    required: true,
    type: 'array',
    min: 1,
    message: 'Vui lòng chọn thiết bị',
  },
  permission: [
    {
      required: true,
      message: 'Vui lòng chọn quyền',
    },
  ],
})
const dataFormSchema = computed(() => ({
  userName: {
    required: true,
    type: 'string',
    message: 'Vui lòng nhập username',
  },
  email: {
    required: true,
    type: 'email',
    message: 'Vui lòng email',
  },
  password: {
    required: action.value === 'create',
    type: 'string',
    min: 6,
    message: 'Vui nhập mật khẩu',
  },
  role: {
    required: true,
    type: 'number',
    message: 'Vui lòng role',
  },
}))
const permissions = ref([
  { name: 'Chỉ xem', code: EPermission.READ },
  { name: 'Điều khiển', code: EPermission.CONTROL },
  { name: 'Chỉnh sửa', code: EPermission.EDIT },
])
const createDataForm = ref({
  userName: '',
  email: '',
  password: '',
  role: EUserRole.NORMAL,
})
const submitAction = computed(() => {
  return action.value === 'update' ? updateUser : createUser
})
const loginUserRole = computed(() => {
  const loginUser = store.state.user
  if (loginUser) return loginUser.role
  return EUserRole.NORMAL
})

onMounted(async () => {
  await fetchData()
  const deviceResponse = await fetchDevice()
  devices.value = deviceResponse.map((el) => {
    return {
      name: `${el.hardwareId}`,
      code: el.id,
    }
  })
})
function onOpenCreateSetting() {
  activeTab.value = 0
  action.value = 'create'
  openRightBar.value = true
}
function updateUser() {
  dataFormErrors.value = {}
  useValidator(dataFormSchema.value)
    .validate(currentActionRows.value)
    .then(async (data) => {
      store.dispatch('startLoading')
      try {
        const { id } = currentActionRows.value
        const response = await editUser(axios, id, data)
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
function createUser() {
  dataFormErrors.value = {}
  useValidator(dataFormSchema.value)
    .validate(createDataForm.value)
    .then(async (data) => {
      store.dispatch('startLoading')
      try {
        const response = await addUser(axios, data)
        if (!response.success) {
          toast.error(response.message, { timeout: 5000 })
          return
        }
        toast.success(response.message, { timeout: 5000 })
        createDataForm.value = {
          userName: '',
          email: '',
          password: '',
          role: EUserRole.NORMAL,
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
async function fetchData() {
  store.dispatch('startLoading')
  try {
    const response = await searchUser(axios, query.value)
    if (!response.success) {
      toast.error(response.message, {
        timeout: 5000,
      })
    } else {
      totalRecords.value = response.meta.totalItems
      data.value = response.data.map((el, index) => {
        const role = Object.keys(EUserRole).find((key) => EUserRole[key] === el.role)
        return {
          ...el,
          displayRole: role,
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
async function fetchDevice() {
  const response = await searchDevice(axios, { limit: 1000, page: 1 })
  if (!response.success) {
    return []
  }
  return response.data
}
async function fetchUserPermission() {
  const { id } = currentActionRows.value
  const response = await getUserPermission(axios, id)
  if (response.success) {
    currentPermissions.value = response.data
  }
}
function setPermission() {
  permissionsFormErrors.value = {}
  useValidator(schema.value)
    .validate(permissionsForm.value)
    .then(async (data) => {
      store.dispatch('startLoading')
      try {
        const { id } = currentActionRows.value
        const formData = data.devices.map((el) => {
          return {
            deviceId: el.code,
            permission: data.permission.code,
          }
        })
        const response = await setUserPermission(axios, id, { payload: formData })
        if (!response.success) {
          toast.error(response.message, { timeout: 5000 })
          return
        }
        await fetchUserPermission()
        permissionsForm.value = {
          devices: [],
          permission: '',
        }
      } catch (err) {
        toast.error(err.message, { timeout: 5000 })
      } finally {
        store.dispatch('stopLoading')
      }
    })
    .catch(({ fields }) => {
      permissionsFormErrors.value = fields
      store.dispatch('stopLoading')
    })
}
async function deletePermission(deviceId) {
  store.dispatch('startLoading')
  try {
    const { id } = currentActionRows.value
    const response = await deleteUserPermission(axios, id, deviceId)
    if (!response.success) {
      toast.error(response.message, { timeout: 5000 })
      return
    }
    await fetchUserPermission()
  } catch (err) {
    toast.error(err.message, { timeout: 5000 })
  } finally {
    store.dispatch('stopLoading')
  }
}

async function onTabChange(tab) {
  const { index } = tab
  if (index === 1) {
  }
}

async function onOpenSetting(row) {
  currentActionRows.value = row
  openRightBar.value = true
  activeTab.value = 0
  action.value = 'update'
  await fetchUserPermission()
}
async function onChangePage(page) {
  query.value.page = page.page + 1
  await fetchData()
}
</script>

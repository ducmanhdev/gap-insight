<template>
    <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
        <a-breadcrumb>
            <a-breadcrumb-item>Home</a-breadcrumb-item>
            <a-breadcrumb-item>List tenant</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="flex items-center space-x-2">
            <a-button
                    v-if="isAdmin"
                    type="primary"
                    html-type="button"
                    @click="handleOpenCreateTenantModal()"
            >
                Create tenant
            </a-button>
            <a-button
                    v-if="isAdmin || isManager"
                    type="primary"
                    html-type="button"
                    @click="handleOpenCreateTenantAppModal()"
            >
                Create app tenant
            </a-button>
        </div>
    </div>
    <a-form
            class="!mb-4 grid grid-cols-5 gap-4"
            :model="filters"
            autocomplete="off"
            @finish="handleFilter"
    >
        <a-input
                v-model:value="filters.app_name"
                placeholder="App name"
        ></a-input>
        <a-input
                v-model:value="filters.tenant_name"
                placeholder="Tenant name"
        ></a-input>
        <a-input
                v-model:value="filters.tenant_type"
                placeholder="Tenant type"
        ></a-input>
        <a-select
                v-model:value="filters.status"
                placeholder="Status"
                :options="filterStatusOptions"
        ></a-select>
        <div class="grid grid-cols-2 gap-4">
            <a-button
                    type="primary"
                    block
                    html-type="submit"
            >
                Filter
            </a-button>
            <a-button
                    type="primary"
                    danger
                    block
                    @click="handleResetFilter"
            >
                Reset
            </a-button>
        </div>
    </a-form>
    <a-table
            :loading="isGetListLoading"
            :columns="columns"
            :data-source="listTenant"
            bordered
            @change="handleTableChange"
            :pagination="listTenantMeta"
            :scroll="{ x: 320 }"
    >
        <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
            <div class="p-2">
                <a-input
                        :placeholder="`Search ${column.dataIndex}`"
                        :value="selectedKeys[0]"
                        @change="(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                        @pressEnter="confirm"
                />
                <div class="grid grid-cols-2 mt-1 gap-1">
                    <a-button type="primary" @click="confirm">
                        <template #icon>
                            <SearchOutlined/>
                        </template>
                        Search
                    </a-button>
                    <a-button @click="clearFilters();confirm()">Reset</a-button>
                </div>
            </div>
        </template>
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
                <a-tag
                        :color="record.status === 1 ? 'blue' : 'red'"
                >
                    {{ record.status === 1 ? 'Active' : 'Inactive' }}
                </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
                <div class="flex items-center space-x-2">
                    <a-button
                            type="primary"
                            @click="handleOpenCreateTenantModal(record)"
                    >
                        Edit
                    </a-button>
                    <a-button
                            type="primary"
                            danger
                            @click="handleDelete(record.id)"
                    >
                        Delete
                    </a-button>
                </div>
            </template>
        </template>
        <template #expandedRowRender="{ record }">
            <a-table
                    :columns="innerColumns"
                    :data-source="record.tenant_apps"
                    :pagination="false"
                    bordered
            >
                <template #bodyCell="{ column, record: innerRecord }">
                    <template v-if="column.key === 'app_version'">
                        {{ innerRecord?.app_version?.app_version }}
                    </template>
                    <template v-if="column.key === 'url'">
                        <a :href="innerRecord?.app_version?.url">{{ innerRecord?.app_version?.url }}</a>
                    </template>
                    <template v-if="column.key === 'action'">
                        <div class="flex items-center space-x-2">
                            <a-button
                                    type="primary"
                                    @click="handleOpenCreateTenantAppModal({
                  id: innerRecord?.id,
                  tenant_id: record?.id,
                  tenant_name: record?.tenant_name,
                  app_id: innerRecord?.app?.id,
                  app_version_id: innerRecord?.app_version?.id,
                  status: innerRecord?.status,
                })"
                            >
                                Edit
                            </a-button>
                            <a-button
                                    type="primary"
                                    danger
                                    @click="handleDeleteAppTenant(innerRecord.id)"
                            >
                                Delete
                            </a-button>
                        </div>
                    </template>
                    <template v-else>
                        {{ innerRecord.app[column.key] }}
                    </template>
                </template>
            </a-table>
        </template>
    </a-table>

    <modal-create-tenant
            ref="modalCreateTenant"
            @success="handleReloadData"
    ></modal-create-tenant>

    <modal-create-app-tenant
            ref="modalCreateAppTenant"
            @success="handleReloadData"
    ></modal-create-app-tenant>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {useTenantStore} from "@/stores/tenant";
import type {TableColumnType, TableProps} from 'ant-design-vue';
import {ParamsRequest} from "@/types";
import {notification, Modal} from 'ant-design-vue';
import ModalCreateTenant from "./ModalCreateTenant.vue";
import ModalCreateAppTenant from "./ModalCreateAppTenant.vue";
import {useTransformTableSorter} from "@/utils/transform";
import {SearchOutlined} from '@ant-design/icons-vue';
import handleError from "@/utils/error";
import {filterStatusOptions, ROLES} from "@/constants";
import {useUserStore} from "@/stores/user";

const userStore = useUserStore();
const tenantStore = useTenantStore();
const getListRequests = ref<ParamsRequest>({});
// const listTenant = computed(() => tenantStore.listTenant.map((item: any) => ({
//     ...item,
//     key: item.id,
// })));
const listTenant = computed(() => tenantStore.listTenant
.filter((x: any) => x.tenant_apps.length || !getListRequests.value.app_name)
.map((item: any) => ({
    ...item,
    key: item.id,
})));

const listTenantMeta = computed(() => tenantStore.listTenantMeta);
const isGetListLoading = ref(false);

const handleGetList = async () => {
    try {
        isGetListLoading.value = true;
        await tenantStore.getListTenant(getListRequests.value);
    } catch (error: any) {
        handleError({error: error});
    } finally {
        isGetListLoading.value = false;
    }
};
watch(
    getListRequests,
    handleGetList,
    {
        deep: true,
        immediate: true
    }
)

const isAdmin = computed(() => userStore.userInfo?.role === ROLES.ADMIN);
const isManager = computed(() => userStore.userInfo?.role === ROLES.MANAGER);

const sortedInfo = ref<any>(null);
const columns = computed<TableColumnType[]>(() => {
    const sorted = sortedInfo.value || {};
    const columns: TableColumnType[] = [
        {
            title: 'Tenant name',
            dataIndex: 'tenant_name',
            key: 'tenant_name',
            width: '30%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'tenant_name' && sorted?.order,
        },
        {
            title: 'Tenant type',
            dataIndex: 'tenant_type',
            key: 'tenant_type',
            width: '28%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'tenant_type' && sorted?.order,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '28%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'status' && sorted?.order,
        },
    ];
    if(isAdmin.value) {
        columns.push({
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: '14%',
        })
    }
    return columns;
});
const innerColumns = computed<TableColumnType[]>(() => {
    const columns: TableColumnType[] = [
        {
            title: 'App name',
            dataIndex: 'app_name',
            key: 'app_name',
            width: '18%',
        },
        {
            title: 'App version',
            dataIndex: 'app_version',
            key: 'app_version',
            width: '18%',
        },
        {
            title: 'Url',
            dataIndex: 'url',
            key: 'url',
            width: '18%',
        },
        {
            title: 'App description',
            dataIndex: 'app_description',
            key: 'app_description',
            width: '18%',
        },
        {
            title: 'Installation',
            dataIndex: 'installation',
            key: 'installation',
            width: '14%',
        },
    ];
    if (isAdmin.value || isManager.value) {
        columns.push({
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: '14%',
        })
    }
    return columns;
})

const handleTableChange: TableProps['onChange'] = (pagination, filters, sorter) => {
    sortedInfo.value = sorter;
    getListRequests.value = {
        ...getListRequests.value,
        page: pagination.current,
        'per-page': pagination.pageSize,
        sort: useTransformTableSorter(sorter),
        ...filters,
    }
};

const isDeleteLoading = ref(false);
const handleDelete = async (id: number) => {
    try {
        isDeleteLoading.value = true;
        Modal.confirm({
            content: 'Are you sure to delete this tenant?',
            async onOk() {
                await tenantStore.deleteTenant(id);
                handleReloadData();
                notification.success({
                    message: `Delete tenant success!`,
                });
            },
            onCancel() {
                Modal.destroyAll();
            },
        });
    } catch (error: any) {
        handleError({error: error, message: `Delete tenant fail!`});
    } finally {
        isDeleteLoading.value = false;
    }
};

const modalCreateTenant = ref<InstanceType<typeof ModalCreateTenant> | null>(null);
const handleOpenCreateTenantModal = (data?: any) => {
    modalCreateTenant.value?.show(data);
};

const modalCreateAppTenant = ref<InstanceType<typeof ModalCreateAppTenant> | null>(null);
const handleOpenCreateTenantAppModal = (data?: any) => {
    modalCreateAppTenant.value?.show(data);
};

const isDeleteAppTenantLoading = ref(false);
const handleDeleteAppTenant = async (id: number) => {
    try {
        isDeleteAppTenantLoading.value = true;
        Modal.confirm({
            content: 'Are you sure to delete this app tenant?',
            async onOk() {
                await tenantStore.deleteAppTenant(id);
                handleReloadData();
                notification.success({
                    message: `Delete app tenant success!`,
                });
            },
            onCancel() {
                Modal.destroyAll();
            },
        });
    } catch (error: any) {
        handleError({error: error, message: `Delete app tenant fail!`});
    } finally {
        isDeleteAppTenantLoading.value = false;
    }
};

const handleReloadData = () => {
    handleGetList();
    modalCreateAppTenant.value?.reloadData();
}

const initFilters = {
    app_name: '',
    tenant_name: '',
    tenant_type: '',
    status: null,
}

const filters = ref({...initFilters});
const handleFilter = () => {
    const _filters = Object.fromEntries(
        Object.entries(filters.value).map(([key, value]: any) => ([key, value?.trim ? value.trim() : value]))
    );
    console.log({_filters});
    
    getListRequests.value = {
        ...getListRequests.value,
        ..._filters,
        page: 1,
    }
}
const handleResetFilter = () => {
    filters.value = {...initFilters};
    getListRequests.value = {};
    sortedInfo.value = null;
}
</script>

<style scoped>

</style>
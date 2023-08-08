<template>
    <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
        <a-breadcrumb>
            <a-breadcrumb-item>Home</a-breadcrumb-item>
            <a-breadcrumb-item>List app</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="flex items-center space-x-2" v-if="isAdmin">
            <a-button
                    type="primary"
                    html-type="button"
                    @click="handleOpenCreateAppModal()"
            >
                Create app
            </a-button>
            <a-button
                    type="primary"
                    html-type="button"
                    @click="handleOpenCreateAppVersionModal()"
            >
                Create app version
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
        <a-select
            v-model:value="filters.app_version_type"
            placeholder="Types"
            :options="filterTypeOptions"
        ></a-select>
        <a-input
                v-model:value="filters.installation"
                placeholder="Installation"
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
            :data-source="listApp"
            bordered
            @change="handleTableChange"
            :pagination="listAppMeta"
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
                            @click="handleOpenCreateAppModal(record)"
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
                    :data-source="record.versions"
                    :pagination="false"
                    bordered
            >
                <template #bodyCell="{ column, record: innerRecord }">
                    <template v-if="column.key === 'url'">
                        <a
                                :href="innerRecord.url"
                                target="_blank"
                                class="underline"
                        >
                            {{ innerRecord.url }}
                        </a>
                    </template>
                    <template v-if="column.key === 'action'">
                        <div class="flex items-center space-x-2">
                            <a-button
                                    type="primary"
                                    @click="handleOpenCreateAppVersionModal(innerRecord)"
                            >
                                Edit
                            </a-button>
                            <a-button
                                    type="primary"
                                    danger
                                    @click="handleDeleteAppVersion(innerRecord.id)"
                            >
                                Delete
                            </a-button>
                        </div>
                    </template>
                </template>
            </a-table>
        </template>
    </a-table>

    <modal-create-app
            ref="modalCreateApp"
            @success="handleReloadData"
    ></modal-create-app>

    <modal-create-app-version
            ref="modalCreateAppVersion"
            @success="handleReloadData"
    ></modal-create-app-version>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {useAppStore} from "@/stores/app";
import type {TableColumnType, TableProps} from 'ant-design-vue';
import {ParamsRequest} from "@/types";
import {notification, Modal} from 'ant-design-vue';
import ModalCreateApp from "./ModalCreateApp.vue";
import ModalCreateAppVersion from "./ModalCreateAppVersion.vue";
import {useTransformTableSorter} from "@/utils/transform";
import {SearchOutlined} from '@ant-design/icons-vue';
import handleError from "@/utils/error";
import {filterStatusOptions, filterTypeOptions, ROLES} from "@/constants";
import {useRoute} from 'vue-router';
import {useUserStore} from "@/stores/user";

const route = useRoute();
const userStore = useUserStore();
const appStore = useAppStore();
const listApp = computed(() => appStore.listApp.map((item: any) => ({
    ...item,
    key: item.id,
})));
const listAppMeta = computed(() => appStore.listAppMeta);
const isGetListLoading = ref(false);

const getListRequests = ref<ParamsRequest>({});
const handleGetList = async () => {
    try {
        isGetListLoading.value = true;
        await appStore.getListApp(getListRequests.value);
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
const sortedInfo = ref<any>(null);
const columns = computed<TableColumnType[]>(() => {
    const sorted = sortedInfo.value || {};
    const columns: TableColumnType[] = [
        {
            title: 'App name',
            dataIndex: 'app_name',
            key: 'app_name',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'app_name' && sorted?.order,
        },
        {
            title: 'App description',
            dataIndex: 'app_description',
            key: 'app_description',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'app_description' && sorted?.order,
        },
        {
            title: 'installation',
            dataIndex: 'installation',
            key: 'installation',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'installation' && sorted?.order,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '14%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'status' && sorted?.order,
        },
    ];
    if (isAdmin.value) {
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
            title: 'App Version',
            dataIndex: 'app_version',
            key: 'app_version',
            width: '30%',
        },
      {
        title: 'App Type',
        dataIndex: 'type',
        key: 'type',
        width: '10%',
      },
        {
            title: 'App description',
            dataIndex: 'app_description',
            key: 'app_description',
            width: '28%',
        },
        {
            title: 'Url',
            dataIndex: 'url',
            key: 'url',
            width: '32%',
        },
    ];
    if (isAdmin.value) {
        columns.push({
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: '14%',
        })
    }
    return columns;
});

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
            content: 'Are you sure to delete this app?',
            async onOk() {
                await appStore.deleteApp(id);
                handleReloadData();
                notification.success({
                    message: `Delete app success!`,
                });
            },
            onCancel() {
                Modal.destroyAll();
            },
        });
    } catch (error: any) {
        handleError({error: error, message: `Delete app fail!`});
    } finally {
        isDeleteLoading.value = false;
    }
};

const modalCreateApp = ref<InstanceType<typeof ModalCreateApp> | null>(null);
const handleOpenCreateAppModal = (data?: any) => {
    modalCreateApp.value?.show(data);
};

const modalCreateAppVersion = ref<InstanceType<typeof ModalCreateAppVersion> | null>(null);
const handleOpenCreateAppVersionModal = (data?: any) => {
    modalCreateAppVersion.value?.show(data);
};

const isDeleteAppVersionLoading = ref(false);
const handleDeleteAppVersion = async (id: number) => {
    try {
        isDeleteAppVersionLoading.value = true;
        Modal.confirm({
            content: 'Are you sure to delete this app version?',
            async onOk() {
                await appStore.deleteAppVersion(id);
                handleReloadData();
                notification.success({
                    message: `Delete app version success!`,
                });
            },
            onCancel() {
                Modal.destroyAll();
            },
        });
    } catch (error: any) {
        handleError({error: error, message: `Delete app version success!`});
    } finally {
        isDeleteAppVersionLoading.value = false;
    }
};

const handleReloadData = () => {
    handleGetList();
    modalCreateAppVersion.value?.reloadData();
}

const initFilters = {
    app_name: '',
    app_version_type: null,
    installation: '',
    status: null,
}

const filters = ref({...initFilters});
const handleFilter = () => {
    const _filters = Object.fromEntries(
        Object.entries(filters.value).map(([key, value]: any) => ([key, value?.trim ? value.trim() : value]))
    );
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
<template>
    <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
        <a-breadcrumb>
            <a-breadcrumb-item>Home</a-breadcrumb-item>
            <a-breadcrumb-item>APK</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="flex items-center space-x-2" v-if="isAdmin">
            <a-button
                    type="primary"
                    html-type="button"
                    @click="handleOpenCreateModal()"
            >
                Create
            </a-button>
        </div>
    </div>
    <a-form
            class="!mb-4 grid grid-cols-4 gap-4"
            :model="filters"
            autocomplete="off"
            @finish="handleFilter"
    >
        <a-input
                v-model:value="filters.version"
                placeholder="Version"
        ></a-input>
        <a-input
                v-model:value="filters.release_notes"
                placeholder="Release notes"
        ></a-input>
        <a-date-picker v-model:value="filters.release_date" value-format="YYYY-MM-DD" placeholder="Release date"
                       class="w-full"/>
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
            :data-source="list"
            bordered
            @change="handleTableChange"
            :pagination="listMeta"
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
            <template v-if="column.key === 'action'">
                <div class="flex items-center space-x-2">
                    <a-button
                            type="primary"
                            @click="handleOpenCreateModal(record)"
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
    </a-table>
    <modal-create ref="modalCreate" @success="handleReloadData"></modal-create>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {useApkStore} from "@/stores/apk";
import type {TableColumnType, TableProps} from 'ant-design-vue';
import {ParamsRequest} from "@/types";
import {notification, Modal} from 'ant-design-vue';
import ModalCreate from "./ModalCreate.vue";
import {useTransformTableSorter} from "@/utils/transform";
import {SearchOutlined} from '@ant-design/icons-vue';
import handleError from "@/utils/error";
import {useUserStore} from "@/stores/user";
import {ROLES} from "@/constants";

const userStore = useUserStore();
const apkStore = useApkStore();

const list = computed(() => apkStore.list.map((item: any) => ({
    ...item,
    key: item.id,
})));
const listMeta = computed(() => apkStore.listMeta);
const isGetListLoading = ref(false);

const getListRequests = ref<ParamsRequest>({});
const handleGetList = async () => {
    try {
        isGetListLoading.value = true;
        await apkStore.getList(getListRequests.value);
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
            title: 'Release date',
            dataIndex: 'release_date',
            key: 'release_date',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'release_date' && sorted?.order,
        },
        {
            title: 'Release notes',
            dataIndex: 'release_notes',
            key: 'release_notes',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'release_notes' && sorted?.order,
        },
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
            width: '14%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'version' && sorted?.order,
        },
        {
            title: 'Url',
            dataIndex: 'url',
            key: 'url',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'url' && sorted?.order,
        },
    ];
    if (isAdmin.value) {
        columns.push({
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: '14%',
        });
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
            content: 'Are you sure to delete this apk?',
            async onOk() {
                await apkStore.delete(id);
                handleReloadData();
                notification.success({
                    message: `Delete success!`,
                });
            },
            onCancel() {
                Modal.destroyAll();
            },
        });
    } catch (error: any) {
        handleError({error: error, message: `Delete fail!`});
    } finally {
        isDeleteLoading.value = false;
    }
};

const modalCreate = ref<InstanceType<typeof ModalCreate> | null>(null);
const handleOpenCreateModal = (data?: any) => {
    modalCreate.value?.show(data);
};

const handleReloadData = () => {
    handleGetList();
}

const initFilters = {
    version: "",
    release_notes: "",
    release_date: "",
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
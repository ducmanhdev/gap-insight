<template>
    <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
        <a-breadcrumb>
            <a-breadcrumb-item>Home</a-breadcrumb-item>
            <a-breadcrumb-item>Manager</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="flex items-center space-x-2">
            <a-button
                    type="primary"
                    html-type="button"
                    @click="handleOpenCreateUserModal()"
            >
                Create user
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
                v-model:value="filters.email"
                placeholder="Email"
        ></a-input>
        <a-input
                v-model:value="filters.username"
                placeholder="Username"
        ></a-input>
        <a-select
                v-model:value="filters.status"
                placeholder="Status"
                :options="filterStatusOptions"
        ></a-select>
        <a-select
                v-model:value="filters.role_input"
                placeholder="Role"
                :options="filterRoleOptions"
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
            :loading="isGetListUserLoading"
            :columns="columns"
            :data-source="listUser"
            bordered
            @change="handleTableChange"
            :pagination="listUserMeta"
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
            <template v-if="column.key === 'role'">
                <span class="capitalize">{{ record.role }}</span>
            </template>
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
                            @click="handleOpenCreateUserModal(record)"
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
    <modal-create ref="modalCreateRef" @success="handleReloadData"></modal-create>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import type {TableColumnType, TableProps} from 'ant-design-vue';
import {notification, Modal} from 'ant-design-vue';
import ModalCreate from "./ModalCreate.vue";
import {useTransformTableSorter} from "@/utils/transform";
import {SearchOutlined} from '@ant-design/icons-vue';
import handleError from "@/utils/error";
import {useUserStore} from "@/stores/user";
import {ParamsRequest} from "@/types";
import {filterRoleOptions, filterStatusOptions, ROLES} from "@/constants";
import {useRouter} from "vue-router";

const router = useRouter();
const userStore = useUserStore();

const isAdmin = computed(() => userStore.userInfo?.role === ROLES.ADMIN);
if (!isAdmin) {
    router.push({
        name: 'Apps'
    })
}

const listUser = computed(() => userStore.listUser.map((item: any) => ({
    ...item,
    key: item.id,
})));
const listUserMeta = computed(() => userStore.listUserMeta);
const isGetListUserLoading = ref(false);
const getListUserRequests = ref<ParamsRequest>({});
const handleGetListUser = async () => {
    try {
        isGetListUserLoading.value = true;
        await userStore.getListUser(getListUserRequests.value);
    } catch (error: any) {
        handleError({error: error});
    } finally {
        isGetListUserLoading.value = false;
    }
};
watch(
    getListUserRequests,
    handleGetListUser,
    {
        deep: true,
        immediate: true
    }
)

const sortedInfo = ref<any>(null);
const columns = computed<TableColumnType[]>(() => {
    const sorted = sortedInfo.value || {};
    return [
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'email' && sorted?.order,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'username' && sorted?.order,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: '14%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'role' && sorted?.order,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '24%',
            sorter: {
                multiple: 1,
            },
            sortOrder: sorted?.columnKey === 'status' && sorted?.order,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: '14%',
        },
    ];
});
const handleTableChange: TableProps['onChange'] = (pagination, filters, sorter) => {
    sortedInfo.value = sorter;
    getListUserRequests.value = {
        ...getListUserRequests.value,
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
            content: 'Are you sure to delete this user?',
            async onOk() {
                await userStore.deleteUser({id});
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

const modalCreateRef = ref<InstanceType<typeof ModalCreate> | null>(null);
const handleOpenCreateUserModal = (data?: any) => {
    modalCreateRef.value?.show(data);
};

const handleReloadData = () => {
    handleGetListUser();
}

const initFilters = {
    email: "",
    username: "",
    role_input: null,
    status: null,
}

const filters = ref({...initFilters});
const handleFilter = () => {
    const _filters = Object.fromEntries(
        Object.entries(filters.value).map(([key, value]: any) => ([key, value?.trim ? value.trim() : value]))
    );
    getListUserRequests.value = {
        ...getListUserRequests.value,
        ..._filters,
        page: 1,
    }
}
const handleResetFilter = () => {
    filters.value = {...initFilters};
    getListUserRequests.value = {};
    sortedInfo.value = null;
}
</script>

<style scoped>

</style>
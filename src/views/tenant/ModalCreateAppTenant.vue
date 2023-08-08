<template>
  <a-modal
      v-model:visible="isVisible"
      :title="title"
      :footer="false"
      :after-close="handleAfterClose"
      centered
  >
    <a-form
        ref="formRef"
        layout="vertical"
        :model="formState"
        :rules="formRules"
        autocomplete="off"
        @finish="handleFinish"
    >
      <a-form-item
          label="Tenant"
          name="tenant_id"
      >
        <a-select
            :loading="isGetListTenantLoading"
            v-model:value="formState.tenant_name"
            :options="tenantOptions"
            show-search
            @search="handleSearchTenant"
            :filter-option="false"
        >
        </a-select>
      </a-form-item>
      <a-form-item
          label="App"
          name="app_id"
      >
        <a-select
            :loading="isGetListAppLoading"
            v-model:value="formState.app_id"
            :options="appOptions"
            show-search
            @search="handleSearchApp"
            :filter-option="false"
            @change="handleChangeApp"
        >
        </a-select>
      </a-form-item>
      <a-form-item
          label="App version"
          name="app_version_id"
      >
        <a-select
            :disabled="!formState.app_id"
            :loading="isGetListAppVersionLoading"
            v-model:value="formState.app_version_id"
            :options="appVersionOptions"
            show-search
            @search="handleSearchAppVersion"
            :filter-option="false"
        >
        </a-select>
      </a-form-item>
      <a-form-item
          label="Status"
          name="status"
      >
        <a-select
            v-model:value="formState.status"
            :options="statusOptions"
        >
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button
            type="primary"
            html-type="submit"
            :loading="isFinishLoading">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {useTenantStore} from "@/stores/tenant";
import type {CreateAppTenantRequest} from "@/stores/tenant";
import {useAppStore} from "@/stores/app";
import type {SearchListAppVersionRequest} from "@/stores/app";
import {notification} from 'ant-design-vue';
import type {FormInstance} from 'ant-design-vue';
import type {Rule} from 'ant-design-vue/es/form';
import {ParamsRequest} from "@/types";
import {useDebounce} from "@/utils/debounce";
import handleError from "@/utils/error";

interface Option {
  label: string;
  value: any;
}

const emits = defineEmits<{
  (e: 'success'): void
}>()

const tenantStore = useTenantStore();
const appStore = useAppStore();

// Tenant
const tenantOptions = ref<Option[]>([]);
const isGetListTenantLoading = ref(false);
const handleGetListTenant = async (requestParams?: ParamsRequest) => {
  try {
    isGetListTenantLoading.value = true;
    const response = await tenantStore.searchListTenant(requestParams);
    tenantOptions.value = response.map((tenant: any) => ({
      label: tenant?.tenant_name,
      value: tenant?.id,
    }));
  } catch (error: any) {
    handleError({error : error});
  } finally {
    isGetListTenantLoading.value = false;
  }
};
handleGetListTenant();
const handleSearchTenant = useDebounce((value: string) => {
  handleGetListTenant({
    tenant_name: value,
  })
});
// End tenant

// App
const appOptions = ref<Option[]>([]);
const isGetListAppLoading = ref(false);
const handleGetListApp = async (requestParams?: ParamsRequest) => {
  try {
    isGetListAppLoading.value = true;
    const response = await appStore.searchListApp(requestParams);
    appOptions.value = response.map((app: any) => ({
      label: app?.app_name,
      value: app?.id,
    }))
  } catch (error: any) {
    handleError({error : error});
  } finally {
    isGetListAppLoading.value = false;
  }
};
handleGetListApp();
const handleSearchApp = useDebounce((value: string) => {
  handleGetListApp({
    app_name: value,
  })
});
const handleChangeApp = (id: string) => {
  formState.value.app_version_id = '';
  handleGetListAppVersion({
    app_id: id,
  });
}
// End app

// App version
const appVersionOptions = ref<Option[]>([]);
const isGetListAppVersionLoading = ref(false);
const handleGetListAppVersion = async (params: SearchListAppVersionRequest) => {
  try {
    isGetListAppVersionLoading.value = true;
    const response = await appStore.searchListAppVersion(params);
    appVersionOptions.value = response.map((app: any) => ({
      label: app?.app_version,
      value: app?.id,
    }));
  } catch (error: any) {
    handleError({error : error});
  } finally {
    isGetListAppVersionLoading.value = false;
  }
};
const handleSearchAppVersion = useDebounce((app_version: string) => {
  handleGetListAppVersion({
    app_id: formState.value.app_id,
    app_version: app_version,
  });
});
// End app version

const isVisible = ref(false);
const title = computed(() => `${currentTenantId.value ? 'Update' : 'Create'}`);

const resetState = () => {
  currentTenantId.value = null;
  formRef.value!.resetFields();
  formState.value = {...initFormState};
}
const show = (data?: any) => {
  if (data) {
    currentTenantId.value = data?.id;
    formState.value = {
      tenant_id: data?.tenant_id,
      tenant_name: data?.tenant_name,
      app_id: data?.app_id,
      app_version_id: data?.app_version_id,
      status: data.status,
    };
    if (formState.value.app_id) {
      handleGetListAppVersion({
        app_id: formState.value.app_id,
      });
    }
  }
  isVisible.value = true;
}
const hide = () => {
  isVisible.value = false;
}
const handleAfterClose = () => {
  resetState();
}

const currentTenantId = ref<number | null>(null);
const initFormState = {
  tenant_name: '',
  app_id: '',
  app_version_id: '',
  status: 1
};
const statusOptions = [
  {
    label: 'Active',
    value: 1,
  },
  {
    label: 'Inactive',
    value: 0
  }
]
const formRef = ref<FormInstance | null>(null);
const formState = ref<any>({...initFormState});
const formRules = ref<Record<string, Rule[]>>({
  tenant_id: [{required: true, message: 'Please select tenant!'}],
  app_id: [{required: true, message: 'Please select app!'}],
  app_version_id: [{required: true, message: 'Please select app version!'}],
})
const isFinishLoading = ref(false);
const handleFinish = async () => {
  try {
    isFinishLoading.value = true;
    if (currentTenantId.value) {
      await tenantStore.updateAppTenant({
        id: currentTenantId.value!,
        ...formState.value,
      })
    } else {
      await tenantStore.createAppTenant({
        ...formState.value,
      })
    }
    notification.success({
      message: `${currentTenantId.value ? 'Update' : 'Create'} app tenant success!`,
    });
    emits('success');
    hide();
  } catch (error: any) {
    handleError({error : error, message : `${currentTenantId.value ? 'Update' : 'Create'} app tenant fail!`});
  } finally {
    isFinishLoading.value = false;
  }
};

const reloadData = () => {
  handleGetListTenant();
  handleGetListApp();
}
defineExpose({
  show,
  hide,
  reloadData
});
</script>

<style scoped>

</style>
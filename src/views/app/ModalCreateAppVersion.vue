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
          label="App name"
          name="app_id"
      >
        <a-select
            :loading="isGetListAppLoading"
            v-model:value="formState.app_id"
            :options="appOptions"
            show-search
            @search="handleSearchApp"
            :filter-option="false"
        >
        </a-select>
      </a-form-item>
      <a-form-item
          label="Type"
          name="type"
      >
        <a-select
            :loading="isGetListAppLoading"
            v-model:value="formState.type"
            :options="typeOptions"
            show-search
            @search="handleSearchApp"
            :filter-option="false"
        >
        </a-select>
      </a-form-item>
      <a-form-item
          label="App description"
          name="app_description"
      >
        <a-input v-model:value="formState.app_description"/>
      </a-form-item>
      <a-form-item
          label="App version"
          name="app_version"
      >
        <a-input v-model:value="formState.app_version"/>
      </a-form-item>
      <a-form-item
          label="Url"
          name="url"
      >
        <a-input v-model:value="formState.url"/>
      </a-form-item>
      <a-form-item
          label="Short description"
          name="short_description"
      >
        <a-input v-model:value="formState.short_description"/>
      </a-form-item>
      <a-form-item
          label="Installation"
          name="installation"
      >
        <a-input v-model:value="formState.installation"/>
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
import {useAppStore} from "@/stores/app";
import type {CreateAppVersionRequest} from "@/stores/app";
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

const appStore = useAppStore();

const appOptions = ref<Option[]>([]);
const typeOptions = ref<Option[]>([{label: 'Dev', value: 'dev'}, {label: 'Production', value: 'production'}]);
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
const handleSearchApp = useDebounce((app_name: string) => {
  handleGetListApp({
    app_name: app_name,
  })
});

const isVisible = ref(false);
const title = computed(() => `${currentAppVersionId.value ? 'Update' : 'Create'}`);

const show = (data?: any) => {
  if (data) {
    currentAppVersionId.value = data?.id;
    formState.value = {
      app_id: data?.app_id,
      type: data?.type,
      app_description: data?.app_description,
      app_version: data?.app_version,
      url: data?.url,
      short_description: data?.short_description,
      installation: data?.installation,
    }
  }
  isVisible.value = true;
}
const hide = () => {
  isVisible.value = false;
}
const handleAfterClose = () => {
  currentAppVersionId.value = null;
  formRef.value!.resetFields();
}

const currentAppVersionId = ref<number | null>(null);
const initFormState = {
  app_id: "",
  type: "",
  app_description: "",
  app_version: "",
  url: "",
  short_description: "",
  installation: "",
};

const formRef = ref<FormInstance | null>(null);
const formState = ref<CreateAppVersionRequest>({...initFormState});
const formRules = ref<Record<string, Rule[]>>({
  app_id: [{required: true, message: 'Please input app id!'}],
  type: [{required: true, message: 'Please input app type!'}],
  app_description: [{required: true, message: 'Please input app description!'}],
  app_version: [{required: true, message: 'Please input app version!'}],
  url: [{required: true, message: 'Please input url!'}],
  short_description: [{required: false, message: 'Please input short description!'}],
  installation: [{required: false, message: 'Please input installation!'}],
})
const isFinishLoading = ref(false);
const handleFinish = async () => {
  try {
    isFinishLoading.value = true;
    if (currentAppVersionId.value) {
      await appStore.updateAppVersion({
        id: currentAppVersionId.value!,
        ...formState.value,
      })
    } else {
      await appStore.createAppVersion({
        ...formState.value,
      })
    }
    notification.success({
      message: `${currentAppVersionId.value ? 'Update' : 'Create'} app version success!`,
    });
    emits('success');
    hide();
  } catch (error: any) {
    handleError({error : error, message : `${currentAppVersionId.value ? 'Update' : 'Create'} app version fail!`});
  } finally {
    isFinishLoading.value = false;
  }
};

const reloadData = () => {
  handleGetListApp();
}
defineExpose({
  show,
  hide,
  reloadData,
});
</script>

<style scoped>

</style>
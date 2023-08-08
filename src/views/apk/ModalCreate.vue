<template>
  <a-modal
      v-model:visible="isVisible"
      :title="title"
      :footer="false"
      :after-close="handleAfterClose"
      :width="800"
      centered
      :mask-closable="!isFinishLoading"
      :closable="!isFinishLoading"
  >
    <a-form
        ref="formRef"
        layout="vertical"
        :model="formState"
        :rules="formRules"
        autocomplete="off"
        @finish="handleFinish"
        class="grid grid-cols-2 gap-4 child:!mb-0"
    >
      <a-form-item
          label="File"
          name="file"
      >
        <input type="file" @change="previewFiles" multiple accept=".apk">
      </a-form-item>
      <a-form-item
          label="Version"
          name="version"
      >
        <a-input v-model:value="formState.version"/>
      </a-form-item>
      <a-form-item
          label="Release notes"
          name="release_notes"
      >
        <a-input v-model:value="formState.release_notes"/>
      </a-form-item>
      <a-form-item
          label="Release date"
          name="release_date"
      >
        <a-date-picker v-model:value="formState.release_date" value-format="YYYY-MM-DD" class="w-full"/>
      </a-form-item>
      <a-form-item
          label="Status"
          name="status"
          class="col-span-2"
      >
        <a-select
            v-model:value="formState.status"
            :options="statusOptions"
        >
        </a-select>
      </a-form-item>
      <a-form-item class="col-span-2 text-center">
        <a-button
            type="primary"
            html-type="submit"
            :loading="isFinishLoading"
            block
        >
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {useApkStore} from "@/stores/apk";
import {notification} from 'ant-design-vue';
import type {FormInstance} from 'ant-design-vue';
import type {Rule} from 'ant-design-vue/es/form';
import handleError from "@/utils/error";
import dayjs from 'dayjs';

const emits = defineEmits<{
  (e: 'success'): void
}>()

const apkStore = useApkStore();
const isVisible = ref(false);
const title = computed(() => `${currentId.value ? 'Update' : 'Create'}`);

const show = (data?: any) => {
  // formState.value.file = null;
  if (data) {
    currentId.value = data?.id;
    formState.value = {
      // file: data?.file,
      version: data?.version,
      status: data?.status,
      release_notes: data?.release_notes,
      release_date: data?.release_date,
    };
  }
  isVisible.value = true;
}
const hide = () => {
  isVisible.value = false;
}
const handleAfterClose = () => {
  currentId.value = null;
  formState.value.file = null;
  formRef.value!.resetFields();
}

const currentId = ref<number | null>(null);
const initFormState = {
  file: null, // apk only
  version: "",
  status: 1,
  release_notes: "",
  release_date: dayjs().format('YYYY-MM-DD'),
};

const formRef = ref<FormInstance | null>(null);
const formState = ref<any>({...initFormState});

const formRules = ref<Record<string, Rule[]>>({
  file: [{required: true, message: 'Please input file!'}],
  version: [{required: true, message: 'Please input version!'}],
  release_notes: [{required: true, message: 'Please input release notes!'}],
  release_date: [{required: true, message: 'Please input release date!'}],
});

const previewFiles = (event: any) => {
  formState.value.file = event.target.files[0];
}
const isFinishLoading = ref(false);
const handleFinish = async () => {
  try {
    isFinishLoading.value = true;
    const data = {
      ...formState.value,
    }
    if (currentId.value) {
      await apkStore.update({
        id: currentId.value!,
        ...data,
      })
    } else {
      await apkStore.create(data)
    }
    notification.success({
      message: `${currentId.value ? 'Update' : 'Create'} success!`,
    });
    emits('success');
    hide();
  } catch (error: any) {
    handleError({error: error, message: `${currentId.value ? 'Update' : 'Create'} fail!`});
  } finally {
    isFinishLoading.value = false;
  }
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
defineExpose({
  show,
  hide,
});
</script>

<style scoped>

</style>
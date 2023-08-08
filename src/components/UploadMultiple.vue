<template>
  <a-upload
      v-model:file-list="fileList"
      :action="UPLOAD_URL"
      name="file"
      list-type="picture-card"
      multiple
      :before-upload="handleBeforeUpload"
      @change="handleChange"
  >
    <div>
      <loading-outlined v-if="isUploadLoading"></loading-outlined>
      <plus-outlined v-else></plus-outlined>
      <div class="ant-upload-text">Upload</div>
    </div>
  </a-upload>
</template>

<script setup lang="ts">
import type {UploadChangeParam, UploadProps} from 'ant-design-vue';
import {PlusOutlined, LoadingOutlined} from '@ant-design/icons-vue';
import {computed, ref} from "vue";
import {notification} from "ant-design-vue";
import handleError from "@/utils/error";

const props = withDefaults(defineProps<{
  modelValue: any
}>(), {
  modelValue: []
});
const emits = defineEmits<{
  (e: 'update:modelValue', newValue: any): void,
}>();
const fileList = computed({
  get() {
    return props.modelValue;
  },
  set(newValue: any) {
    emits('update:modelValue', newValue);
  }
});
const UPLOAD_URL = `${import.meta.env.VITE_BACKEND_PROD_URL || 'http://192.168.1.102:8000'}/api/v1/general/storage/upload`;
// const UPLOAD_URL = 'https://gap-api-service.srv01.dtsmart.dev/api/v1/general/storage/upload';
const isUploadLoading = ref(false);
const handleBeforeUpload = (file: any) => {
  const allowTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  const isAllowType = allowTypes.includes(file.type);
  const allowExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
  const isAllowExtension = allowExtensions.some((extension: string) => file.name.endsWith(extension));
  if (!isAllowType || !isAllowExtension) {
    notification.error({
      message: 'Error',
      description: 'You can only upload PNG, JPG, JPEG, WEBP, SVG file!',
    });
    file.status = 'error';
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    notification.error({
      message: 'Error',
      description: 'Image must smaller than 2MB!',
    });
    file.status = 'error';
  }
  return isAllowType && isAllowExtension && isLt2M;
};

const handleChange = ({file, fileList}: UploadChangeParam) => {
  try {
    isUploadLoading.value = true;
    if (file.status === 'error') {
      throw new Error('Upload error');
    }
    if (file.status === 'done') {
      if (file?.response?.files[0]?.error) {
        file.status = 'error';
        throw new Error(file?.response?.files?.errors);
      }
    }
  } catch (error: any) {
    handleError({error : error});
  } finally {
    isUploadLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
:deep {
  .ant-upload-list-item-actions {
    a {
      display: inline-block;

      span {
        display: block;
        line-height: 1;
      }
    }
  }
}
</style>
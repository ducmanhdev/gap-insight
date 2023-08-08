<template>
  <a-modal
      v-model:visible="isVisible"
      :title="title"
      :footer="false"
      :after-close="handleAfterClose"
      :width="800"
      centered
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
              label="App code"
              name="app_code"
      >
          <a-input v-model:value="formState.app_code"/>
      </a-form-item>
      <a-form-item
          label="App name"
          name="app_name"
      >
        <a-input v-model:value="formState.app_name"/>
      </a-form-item>
      <a-form-item
          label="App description"
          name="app_description"
      >
        <a-input v-model:value="formState.app_description"/>
      </a-form-item>
      <a-form-item
          label="Short description"
          name="short_description"
      >
        <a-input v-model:value="formState.short_description"/>
      </a-form-item>
      <a-form-item
          label="Developer name"
          name="developer_name"
      >
        <a-input v-model:value="formState.developer_name"/>
      </a-form-item>
      <a-form-item
          label="Privacy url"
          name="privacy_url"
      >
        <a-input v-model:value="formState.privacy_url"/>
      </a-form-item>
      <a-form-item
          label="Installation"
          name="installation"
      >
        <a-input v-model:value="formState.installation"/>
      </a-form-item>
      <a-form-item
              label="Color"
              name="color"
      >
          <a-input type="color" v-model:value="formState.color" class="cursor-pointer"/>
      </a-form-item>
      <a-form-item name="is_bottom_bar_show">
          <a-checkbox v-model:checked="formState.is_bottom_bar_show">Is bottom bar show</a-checkbox>
      </a-form-item>
      <a-form-item name="is_fullscreen">
          <a-checkbox v-model:checked="formState.is_fullscreen">Is fullscreen</a-checkbox>
      </a-form-item>
      <a-form-item
          label="Icon largely"
          name="listIconLargely"
      >
        <upload-single v-model="listIconLargely"></upload-single>
      </a-form-item>
      <a-form-item
          label="Icon small"
          name="listIconSmall"
      >
        <upload-single v-model="listIconSmall"></upload-single>
      </a-form-item>
      <a-form-item
          label="Banner largely"
          name="listBannerLargely"
      >
        <upload-single v-model="listBannerLargely"></upload-single>
      </a-form-item>
      <a-form-item
          label="Banner small"
          name="listBannerSmall"
      >
        <upload-single v-model="listBannerSmall"></upload-single>
      </a-form-item>
      <a-form-item
          label="Slider desktop"
          name="sliderDesktop"
      >
        <upload-multiple v-model="listSliderDesktop"></upload-multiple>
      </a-form-item>
      <a-form-item
          label="Slider ipad"
          name="sliderIpad"
      >
        <upload-multiple v-model="listSliderIpad"></upload-multiple>
      </a-form-item>
      <a-form-item
          label="Slider mobile"
          name="sliderMobile"
      >
        <upload-multiple v-model="listSliderMobile"></upload-multiple>
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
import {useAppStore} from "@/stores/app";
import {notification} from 'ant-design-vue';
import type {FormInstance} from 'ant-design-vue';
import type {Rule} from 'ant-design-vue/es/form';
import UploadSingle from "@/components/UploadSingle.vue"
import UploadMultiple from "@/components/UploadMultiple.vue"
import handleError from "@/utils/error";

const emits = defineEmits<{
  (e: 'success'): void
}>()

const appStore = useAppStore();
const isVisible = ref(false);
const title = computed(() => `${currentAppId.value ? 'Update' : 'Create'}`);

const show = (data?: any) => {
  if (data) {
    currentAppId.value = data?.id;
    formState.value = {
      app_code: data?.app_code,
      app_name: data?.app_name,
      app_description: data?.app_description,
      short_description: data?.short_description,
      developer_name: data?.developer_name,
      privacy_url: data?.privacy_url,
      installation: data?.installation,
      is_fullscreen: data?.is_fullscreen === 1,
      is_bottom_bar_show: data?.is_bottom_bar_show === 1,
      color: data?.color,
    };
    listIconLargely.value = data?.icons?.icon_largely ? [{uid: 1, ...data.icons.icon_largely}] : [];
    listIconSmall.value = data?.icons?.icon_small ? [{uid: 1, ...data.icons.icon_small}] : [];
    listBannerSmall.value = data?.banner_previews?.banner_small ? [{uid: 1, ...data.banner_previews.banner_small}] : [];
    listBannerLargely.value = data?.banner_previews?.banner_largely ? [{uid: 1, ...data.banner_previews.banner_largely}] : [];
    listSliderMobile.value = data?.slider_previews?.mobile ? data.slider_previews.mobile : [];
    listSliderIpad.value = data?.slider_previews?.ipad ? data.slider_previews.ipad : [];
    listSliderDesktop.value = data?.slider_previews?.desktop ? data.slider_previews.desktop : [];
  }
  isVisible.value = true;
}
const hide = () => {
  isVisible.value = false;
}
const handleAfterClose = () => {
  currentAppId.value = null;
  formRef.value!.resetFields();
}

const currentAppId = ref<number | null>(null);
const initFormState = {
  app_code: "",
  app_name: "",
  app_description: "",
  short_description: "",
  developer_name: "",
  privacy_url: "",
  installation: "",
  is_bottom_bar_show: false,
  is_fullscreen: false,
  color: '#ffffff',
};
const formRef = ref<FormInstance | null>(null);
const formState = ref<any>({...initFormState});
const formRules = ref<Record<string, Rule[]>>({
  app_code: [{required: true, message: 'Please input app code!'}],
  app_name: [{required: true, message: 'Please input app name!'}],
  app_description: [{required: true, message: 'Please input app description!'}],
  short_description: [{required: true, message: 'Please input short description!'}],
  developer_name: [{required: false, message: 'Please input developer name!'}],
  privacy_url: [{required: false, message: 'Please input privacy url!'}],
  installation: [{required: false, message: 'Please input installation!'}],
});

const listIconLargely = ref<any[]>([]);
const listIconSmall = ref<any[]>([]);
const listBannerLargely = ref<any[]>([]);
const listBannerSmall = ref<any[]>([]);
const listSliderDesktop = ref<any[]>([]);
const listSliderIpad = ref<any[]>([]);
const listSliderMobile = ref<any[]>([]);

const isFinishLoading = ref(false);
const handleFinish = async () => {
  try {
    isFinishLoading.value = true;
    const _handleGetSingleFile = (files: any[]) => {
      if (!Array.isArray(files) || !files.length) return null;
      const file = (files.at(-1) as any)?.response?.files.at(-1) || files.at(-1);
      return (file.status !== 'error' && file.url) ? file : null
    };
    const _handleGetMultipleFile = (files: any[]) => {
      if (!Array.isArray(files)) return [];
      return (files || [])
          .map((item: any) => item?.response?.files ? item.response.files : item)
          .flat()
          .filter((item: any) => item.status !== 'error' && item.url);
    };
    const data = {
      ...formState.value,
      is_bottom_bar_show: formState.value.is_bottom_bar_show ? 1 : 0,
      is_fullscreen: formState.value.is_fullscreen ? 1 : 0,
      banner_preview_inputs: {
        banner_largely: _handleGetSingleFile(listBannerLargely.value),
        banner_small: _handleGetSingleFile(listBannerLargely.value),
      },
      icon_inputs: {
        icon_largely: _handleGetSingleFile(listIconLargely.value),
        icon_small: _handleGetSingleFile(listIconSmall.value),
      },
      slider_preview_inputs: {
        mobile: _handleGetMultipleFile(listSliderMobile.value),
        ipad: _handleGetMultipleFile(listSliderIpad.value),
        desktop: _handleGetMultipleFile(listSliderDesktop.value),
      },
    }
    if (currentAppId.value) {
      await appStore.updateApp({
        id: currentAppId.value!,
        ...data,
      })
    } else {
      await appStore.createApp(data)
    }
    notification.success({
      message: `${currentAppId.value ? 'Update' : 'Create'} app success!`,
    });
    emits('success');
    hide();
  } catch (error: any) {
    handleError({error : error, message : `${currentAppId.value ? 'Update' : 'Create'} app fail!`});
  } finally {
    isFinishLoading.value = false;
  }
};
defineExpose({
  show,
  hide,
});
</script>

<style scoped>

</style>
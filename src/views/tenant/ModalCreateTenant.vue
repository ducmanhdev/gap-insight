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
          label="Tenant name"
          name="tenant_name"
      >
        <a-input v-model:value="formState.tenant_name"/>
      </a-form-item>
      <a-form-item
          label="Tenant type"
          name="tenant_type"
      >
        <a-input v-model:value="formState.tenant_type"/>
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
import type {CreateTenantRequest} from "@/stores/tenant";
import {notification} from 'ant-design-vue';
import type {FormInstance} from 'ant-design-vue';
import type {Rule} from 'ant-design-vue/es/form';
import handleError from "@/utils/error";

const emits = defineEmits<{
  (e: 'success'): void
}>()

const tenantStore = useTenantStore();
const isVisible = ref(false);
const title = computed(() => `${currentTenantId.value ? 'Update' : 'Create'}`);

const show = (data?: any) => {
  if (data) {
    currentTenantId.value = data?.id;
    formState.value = {
      tenant_type: data?.tenant_type,
      tenant_name: data?.tenant_name,
    }
  }
  isVisible.value = true;
}
const hide = () => {
  isVisible.value = false;
}
const resetState = () => {
  currentTenantId.value = null;
  formRef.value!.resetFields();
  formState.value = {...initFormState};
}
const handleAfterClose = () => {
  resetState();
}

const currentTenantId = ref<number | null>(null);
const initFormState = {
  tenant_name: '',
  tenant_type: '',
};

const formRef = ref<FormInstance | null>(null);
const formState = ref<CreateTenantRequest>({...initFormState});
const formRules = ref<Record<string, Rule[]>>({
  tenant_name: [{required: true, message: 'Please input tenant name!'}],
  tenant_type: [{required: true, message: 'Please input tenant type!'}],
})
const isFinishLoading = ref(false);
const handleFinish = async () => {
  try {
    isFinishLoading.value = true;
    if (currentTenantId.value) {
      await tenantStore.updateTenant({
        id: currentTenantId.value!,
        ...formState.value,
      })
    } else {
      await tenantStore.createTenant({
        ...formState.value,
      })
    }
    notification.success({
      message: `${currentTenantId.value ? 'Update' : 'Create'} tenant success!`,
    });
    emits('success');
    hide();
  } catch (error: any) {
    handleError({error : error, message : `${currentTenantId.value ? 'Update' : 'Create'} tenant fail!`});
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
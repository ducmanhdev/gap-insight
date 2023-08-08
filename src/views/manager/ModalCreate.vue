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
                    label="Email"
                    name="email"
            >
                <a-input v-model:value="formState.email"/>
            </a-form-item>
            <a-form-item
                    label="Username"
                    name="username"
            >
                <a-input v-model:value="formState.username"/>
            </a-form-item>
            <a-form-item
                    label="Password"
                    name="password"
            >
                <a-input v-model:value="formState.password"/>
            </a-form-item>
            <a-form-item
                    label="Role"
                    name="role_input"
            >
                <a-select
                        v-model:value="formState.role_input"
                        :options="roleOptions"
                >
                </a-select>
            </a-form-item>
            <a-form-item
                    label="First name"
                    name="firstname"
            >
                <a-input v-model:value="formState.firstname"/>
            </a-form-item>
            <a-form-item
                    label="Last name"
                    name="lastname"
            >
                <a-input v-model:value="formState.lastname"/>
            </a-form-item>
            <a-form-item
                    label="Gender"
                    name="gender"
            >
                <a-select
                        v-model:value="formState.gender"
                        :options="genderOptions"
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
import {notification} from 'ant-design-vue';
import type {FormInstance} from 'ant-design-vue';
import type {Rule} from 'ant-design-vue/es/form';
import handleError from "@/utils/error";
import {useUserStore} from "@/stores/user";

const userStore = useUserStore();

const emits = defineEmits<{
    (e: 'success'): void
}>();

const isVisible = ref(false);
const title = computed(() => `${currentId.value ? 'Update' : 'Create'}`);

const show = (data?: any) => {
    if (data) {
        currentId.value = data?.id;
        formState.value = {
            email: data?.email,
            username: data?.username,
            role_input: data?.role,
            firstname: data?.profile?.firstname,
            lastname: data?.profile?.lastname,
            gender: data?.profile?.gender,
        };
    }
    isVisible.value = true;
}
const hide = () => {
    isVisible.value = false;
}
const handleAfterClose = () => {
    currentId.value = null;
    formRef.value!.resetFields();
}

const currentId = ref<number | null>(null);
const initFormState = {
    email: "",
    username: "",
    password: "",
    role_input: "user",
    firstname: "",
    lastname: "",
    gender: 0,
};
const roleOptions = ref([
    {
        label: 'Admin',
        value: 'admin',
    },
    {
        label: 'Manager',
        value: 'manager',
    },
    {
        label: 'User',
        value: 'user'
    }
]);
const genderOptions = ref([
    {
        label: 'Men',
        value: 0,
    },
    {
        label: 'Women',
        value: 1,
    },
    {
        label: 'Unknown',
        value: 2
    }
]);
const formRef = ref<FormInstance | null>(null);
const formState = ref<any>({...initFormState});

type Rules = {
    [key in keyof typeof initFormState]?: Rule[]
}
const formRules = computed<Record<string, Rule[]>>(() => {
    const rules: Rules = {
        email: [{required: true, message: 'Please input email!'}],
        username: [{required: true, message: 'Please input username!'}],
        password: [{required: true, message: 'Please input release username!'}],
        role_input: [{required: true, message: 'Please input role input!'}],
        firstname: [{required: true, message: 'Please input first name!'}],
        lastname: [{required: true, message: 'Please input last name!'}],
        gender: [{required: true, message: 'Please input gender!'}],
    }
    if (currentId.value) delete rules.password;
    return rules;
});

const isFinishLoading = ref(false);
const handleFinish = async () => {
    try {
        isFinishLoading.value = true;
        const data = {...formState.value};
        if (!data.password) delete data.password;
        if (currentId.value) {
            await userStore.updateUser({
                id: currentId.value!,
                data,
            });
        } else {
            await userStore.createUser(data);
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
defineExpose({
    show,
    hide,
});
</script>

<style scoped>

</style>
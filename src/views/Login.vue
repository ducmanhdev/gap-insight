<template>
    <div class="bg-[#F8F8F8] flex justify-center items-center h-screen p-4">
        <section
                class="max-w-full bg-white text-black w-[500px] p-6 rounded shadow-[rgba(67,71,85,0.2)_0px_0px_5.6px_0px,rgba(90,125,188,0.05)0px_5.6px_8px_0px]">
            <h2 class="text-2xl font-bold text-center text-primary">LOGIN</h2>
            <a-form
                    :model="formState"
                    :rules="formRules"
                    @finish="handleLogin"
                    layout="vertical"
                    autocomplete="off"
            >
                <a-form-item
                        label="Username or email"
                        name="email"
                >
                    <a-input v-model:value="formState.email"/>
                </a-form-item>
                <a-form-item
                        label="Password"
                        name="password"
                >
                    <a-input-password v-model:value="formState.password"/>
                </a-form-item>
                <a-form-item class="!mb-0 text-center">
                    <a-button type="primary" html-type="submit" :disabled="isLoginLoading">Submit</a-button>
                </a-form-item>
            </a-form>
        </section>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useUserStore} from "@/stores/user";
import handleError from "@/utils/error";

const formState = ref({
    email: '',
    password: '',
});

const formRules = ref({
    email: [{required: true, message: 'Please input email!'}],
    password: [{required: true, message: 'Please input password!'}],
});

const userStore = useUserStore();
const isLoginLoading = ref(false);
const handleLogin = async () => {
    try {
        isLoginLoading.value = true;
        await userStore.login(formState.value);
    } catch (error) {
        handleError({error})
    } finally {
        isLoginLoading.value = false;
    }
}
</script>

<style scoped>

</style>
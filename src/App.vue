<template>
    <component v-if="isReady && isRouterReady" :is="layout">
        <RouterView/>
    </component>
    <reload-prompt/>
</template>

<script setup lang="ts">
import {onMounted, ref, computed} from "vue";
import ReloadPrompt from '@/components/ReloadPrompt.vue';
import Default from '@/layouts/Default.vue';
import Empty from '@/layouts/Empty.vue';
import {useRouter, useRoute} from 'vue-router';
import {useUserStore} from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);

const isReady = computed(() => route.name !== 'Login' ? userInfo.value : true);
const isRouterReady = ref(false);
router.isReady().finally(() => isRouterReady.value = true);
const layout = computed<any>(() => route?.meta?.layout === 'Empty' ? Empty : Default);

const handleGetUserInfo = async () => {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return;
        await userStore.getUserInfo();
    } catch (error) {
        console.error(error);
    }
};
handleGetUserInfo();
onMounted(() => {
    const customViewportCorrectionVariable = 'vh';
    const setViewportProperty = () => {
        let prevClientHeight: number;
        const customVar = '--' + (customViewportCorrectionVariable || 'vh');
        const doc = document.documentElement;

        function handleResize() {
            let clientHeight = doc.clientHeight;
            if (clientHeight === prevClientHeight) return;
            requestAnimationFrame(function updateViewportHeight() {
                doc.style.setProperty(customVar, (clientHeight * 0.01) + 'px');
                prevClientHeight = clientHeight;
            });
        }

        handleResize();
        return handleResize;
    }
    window.addEventListener('resize', setViewportProperty());
});
</script>

<style scoped>

</style>

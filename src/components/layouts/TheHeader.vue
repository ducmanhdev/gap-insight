<template>
    <header class="bg-white text-black shadow py-4 z-[999] shrink-0">
        <div class="container flex items-center justify-between">
            <div class="flex items-center">
                <div
                        class="mr-4 cursor-pointer sm:hidden"
                        @click="handleToggleAside"
                >
                    <img
                            :src="isAsideVisible ? getImageUrl('close.png') : getImageUrl('burger-menu.png')"
                            alt=""
                            class="block w-5 h-auto transition-[transform]"
                            :class="{'rotate-180': isAsideVisible}"
                    >
                </div>
                <div class="font-semibold">
                    LOGO
                </div>
            </div>
            <a-dropdown v-if="userInfo">
                <div class="flex items-center space-x-2 font-medium">
                    <a-avatar class="!flex items-center justify-center">
                        <template #icon>
                            <UserOutlined/>
                        </template>
                    </a-avatar>
                    <span>{{ userInfo.username }}</span>
                </div>
                <template #overlay>
                    <a-menu>
                        <a-menu-item @click="userStore.logout">
                            <template #icon>
                                <LogoutOutlined/>
                            </template>
                            Logout
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
            <router-link v-else :to="{name: 'Login'}">Login</router-link>
        </div>
    </header>
</template>

<script setup lang="ts">
import {getImageUrl} from "@/utils/path";
import {useUserStore} from "@/stores/user";
import {computed} from "vue";
import {UserOutlined, LogoutOutlined} from '@ant-design/icons-vue';

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const props = withDefaults(defineProps<{
    isAsideVisible: boolean,
}>(), {
    isAsideVisible: false,
});
const emits = defineEmits<{
    (e: 'toggleAside'): void
}>()
const handleToggleAside = () => {
    emits('toggleAside');
}
</script>

<style scoped>

</style>
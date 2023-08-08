<template>
    <div class="h-screen flex flex-col bg-[#F8F8F8] overflow-hidden">
        <the-header @toggle-aside="handleToggleAside" :is-aside-visible="isAsideVisible"></the-header>
        <main class="grow sm:grid sm:grid-cols-[160px_1fr] relative overflow-hidden">
            <the-aside :is-visible="isAsideVisible" @hide-aside="handleHideAside"></the-aside>
            <section class="h-full relative">
                <div class="absolute inset-0 p-4 overflow-auto">
                    <slot></slot>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import TheAside from "@/components/layouts/TheAside.vue";
import TheHeader from "@/components/layouts/TheHeader.vue";
import {ref} from "vue";
import {useRouter} from "vue-router";

const isAsideVisible = ref(false);
const handleToggleAside = () => {
    isAsideVisible.value = !isAsideVisible.value;
}
const handleHideAside = () => {
    isAsideVisible.value = false;
}

const router = useRouter();
router.afterEach(() => {
    isAsideVisible.value = false;
})
</script>

<style scoped>

</style>
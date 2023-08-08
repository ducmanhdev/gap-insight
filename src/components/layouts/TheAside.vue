<template>
    <aside
            class="bg-black/50 transition-[left] absolute sm:static -left-full h-full sm:h-auto w-full z-50"
            :class="{'!left-0': isVisible}"
            @click="handleHideAside"
    >
        <div class="h-full bg-white text-black shadow w-60 sm:w-full" @click.stop>
            <ul class="">
                <li v-for="item in listMenu">
                    <RouterLink
                            :to="item.path"
                            class="block px-4 py-2 text-inherit transition-none"
                            active-class="bg-primary !text-white"
                    >
                        {{ item.name }}
                    </RouterLink>
                </li>
            </ul>
        </div>
    </aside>
</template>

<script setup lang="ts">
import {useUserStore} from "@/stores/user";
import {computed} from "vue";
import {ROLES} from "@/constants";

const userStore = useUserStore();
const props = withDefaults(defineProps<{
    isVisible: boolean,
}>(), {
    isVisible: false,
});

const emits = defineEmits<{
    (e: 'hideAside'): void,
}>();

const handleHideAside = () => {
    emits('hideAside')
}

const listMenu = computed(() => {
    const menu = [
        {
            name: 'App',
            path: '/'
        },
        {
            name: 'Tenant',
            path: '/tenant'
        },
        {
            name: 'Apk',
            path: '/apk'
        },
    ]
    if (userStore.userInfo?.role === ROLES.ADMIN) {
        menu.push({
            name: 'Manager user',
            path: '/manager'
        })
    }
    return menu;
});
</script>

<style scoped>

</style>
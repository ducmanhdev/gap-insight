import {createRouter, createWebHistory} from "vue-router";
import Apps from "@/views/app/Index.vue";
import {ROLES} from "@/constants";

const routes = [
    {
        path: "/",
        name: "Apps",
        component: Apps,
        meta: {
            roles: [ROLES.ADMIN, ROLES.MANAGER]
        }
    },
    {
        path: "/tenant",
        name: "Tenant",
        component: () => import("@/views/tenant/Index.vue"),
        meta: {
            roles: [ROLES.ADMIN, ROLES.MANAGER]
        }
    },
    {
        path: "/apk",
        name: "Apk",
        component: () => import("@/views/apk/Index.vue"),
        meta: {
            roles: [ROLES.ADMIN]
        }
    },
    {
        path: "/manager",
        name: "Manager",
        component: () => import("@/views/manager/Manager.vue"),
        meta: {
            roles: [ROLES.ADMIN]
        }
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/Login.vue"),
        meta: {
            layout: 'Empty',
        },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import("@/views/NotFound.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to: any) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken && to.name !== 'Login') return {name: "Login"};
    if (accessToken && to.name === 'Login') return '/';
});

export default router;

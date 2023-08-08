import {defineStore} from 'pinia'
import axios from "@/plugins/axios";
import {useTransformMeta} from "@/utils/transform";
import type {ParamsRequest} from "@/types";

export interface CreateTenantRequest {
    tenant_name: string;
    tenant_type: string;
}

export interface UpdateTenantRequest extends CreateTenantRequest {
    id: number;
}

export interface CreateAppTenantRequest {
    tenant_id: string;
    app_id: string;
    app_version_id: string;
    status: 0 | 1;
}

export interface UpdateAppTenantRequest extends CreateAppTenantRequest {
    id: number;
}

export const useTenantStore = defineStore('tenantStore', {
    state: () => ({
        listTenant: [] as any,
        listTenantMeta: {} as any,
    }),
    getters: {},
    actions: {
        getListTenant(params?: ParamsRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    // this.listTenant = [];
                    // this.listTenantMeta = {};
                    const response = await axios.get('/api/v1/admin/tenant/item', {
                        params: params,
                    });
                    this.listTenant = response.data.data.items;
                    this.listTenantMeta = useTransformMeta(response.data.data._meta);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        searchListTenant(params?: ParamsRequest) {
            return new Promise<any>(async (resolve, reject) => {
                try {
                    const response = await axios.get('/api/v1/admin/tenant/item', {
                        params: params,
                    });
                    resolve(response.data.data.items);
                } catch (error) {
                    reject(error);
                }
            })
        },
        createTenant(data: CreateTenantRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.post('/api/v1/admin/tenant/item/create', data);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        updateTenant({id, ...data}: UpdateTenantRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios({
                        url: '/api/v1/admin/tenant/item/update',
                        method: 'POST',
                        params: {
                            id: id
                        },
                        data: data
                    })
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        deleteTenant(id: number) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.delete('/api/v1/admin/tenant/item/delete', {
                        params: {
                            id: id,
                        }
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        createAppTenant(data: CreateAppTenantRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.post('/api/v1/admin/tenant/app/create', data);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        updateAppTenant({id, ...data}: UpdateAppTenantRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios({
                        url: '/api/v1/admin/tenant/app/update',
                        method: 'POST',
                        params: {
                            id: id
                        },
                        data: data
                    })
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        deleteAppTenant(id: number) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.delete('/api/v1/admin/tenant/app/delete', {
                        params: {
                            id: id,
                        }
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
    },
})
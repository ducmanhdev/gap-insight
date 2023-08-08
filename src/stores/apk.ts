import {defineStore} from 'pinia'
import axios from "@/plugins/axios";
import {useTransformMeta} from "@/utils/transform";
import type {ParamsRequest} from "@/types";

export interface CreateAppRequest {
    file: any,
    version: string,
    release_notes: string,
    release_date: string,
}

export interface UpdateAppRequest extends CreateAppRequest {
    id: number;
}

export const useApkStore = defineStore('apkStore', {
    state: () => ({
        list: [],
        listMeta: {}
    }),
    getters: {},
    actions: {
        getList(params?: ParamsRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    // this.list = [];
                    // this.listMeta = {};
                    const response = await axios.get('/api/v1/admin/gap-version/item', {
                        params: params,
                    });
                    this.list = response.data.data.items;
                    this.listMeta = useTransformMeta(response.data.data._meta);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        searchList(params?: ParamsRequest) {
            return new Promise<any>(async (resolve, reject) => {
                try {
                    const response = await axios.get('/api/v1/admin/gap-version/item', {
                        params: params,
                    });
                    resolve(response.data.data.items);
                } catch (error) {
                    reject(error);
                }
            })
        },
        create(data: CreateAppRequest) {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            })
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios({
                        method: 'POST',
                        url: '/api/v1/admin/gap-version/item/create',
                        data: formData,
                        timeout: 120 * 1000,
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        update({id, ...data}: UpdateAppRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios({
                        url: '/api/v1/admin/gap-version/item/update',
                        method: 'POST',
                        params: {
                            id: id,
                        },
                        data: data
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        delete(id: number) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.delete('/api/v1/admin/gap-version/item/delete', {
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
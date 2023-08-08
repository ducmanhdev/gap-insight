import {defineStore} from 'pinia'
import axios from "@/plugins/axios";
import {useTransformMeta} from "@/utils/transform";
import type {ParamsRequest} from "@/types";

interface File {
    name: string;
    base_url: string;
    // delete_url: string;
    path: string;
    size: number;
    type: string;
    url: string;
}

interface IconInputs {
    icon_largely: File;
    icon_small: File;
}

interface SliderPreviewInput {
    mobile: File[];
    ipad: File[];
    desktop: File[];
}

interface BannerPreviewInputs {
    banner_small: File;
    banner_largely: File;
}

interface PropertyInputs {
    support_device: SupportDevice;
}

export interface CreateAppRequest {
    app_name: string;
    app_description: string;
    short_description: string;
    developer_name?: string;
    privacy_url?: string;
    installation?: string;
    icon_inputs?: IconInputs;
    slider_preview_inputs?: SliderPreviewInput;
    banner_preview_inputs?: BannerPreviewInputs;
    property_inputs?: PropertyInputs;
}

export interface UpdateAppRequest extends CreateAppRequest {
    id: number;
}

export interface SearchListAppVersionRequest {
    app_id: string,
    app_version?: string,
}

export interface CreateAppVersionRequest {
    app_id: string;
    type: string;
    app_description: string;
    app_version: string;
    url: string;
    short_description?: string;
    installation?: string;
    property_inputs?: PropertyInput[];
    banner_preview_inputs?: BannerPreviewInput[];
    slider_preview_inputs?: SliderPreviewInput[];
}

interface PropertyInput {
    support_device: SupportDevice;
}

interface SupportDevice {
    mobile: SupportAttrs;
    ipad: SupportAttrs;
    desktop: SupportAttrs;
}

interface SupportAttrs {
    is_support: boolean;
    is_landscape: boolean;
    is_portrait: boolean;
}

interface BannerPreviewInput {
    banner_small: File;
    banner_largely: File;
}

interface SliderPreviewInput {
}

export interface UpdateAppVersionRequest extends CreateAppVersionRequest {
    id: number;
}

export const useAppStore = defineStore('appStore', {
    state: () => ({
        listApp: [],
        listAppMeta: {},
    }),
    getters: {},
    actions: {
        getListApp(params?: ParamsRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    // this.listApp = [];
                    // this.listAppMeta = {};
                    const response = await axios.get('/api/v1/admin/app/item', {
                        params: params,
                    });
                    this.listApp = response.data.data.items;
                    this.listAppMeta = useTransformMeta(response.data.data._meta);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        searchListApp(params?: ParamsRequest) {
            return new Promise<any>(async (resolve, reject) => {
                try {
                    const response = await axios.get('/api/v1/admin/app/item', {
                        params: params,
                    });
                    resolve(response.data.data.items);
                } catch (error) {
                    reject(error);
                }
            })
        },
        searchListAppVersion(params: SearchListAppVersionRequest) {
            return new Promise<any>(async (resolve, reject) => {
                try {
                    const response = await axios.get('/api/v1/admin/app/version', {
                        params: params,
                    });
                    resolve(response.data.data.items);
                } catch (error) {
                    reject(error);
                }
            })
        },
        createApp(data: CreateAppRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.post('/api/v1/admin/app/item/create', data);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        updateApp({id, ...data}: UpdateAppRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios({
                        url: '/api/v1/admin/app/item/update',
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
        deleteApp(id: number) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.delete('/api/v1/admin/app/item/delete', {
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
        createAppVersion(data: CreateAppVersionRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.post('/api/v1/admin/app/version/create', data);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        updateAppVersion({id, ...data}: UpdateAppVersionRequest) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios({
                        url: '/api/v1/admin/app/version/update',
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
        deleteAppVersion(id: number) {
            return new Promise<void>(async (resolve, reject) => {
                try {
                    await axios.delete('/api/v1/admin/app/version/delete', {
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
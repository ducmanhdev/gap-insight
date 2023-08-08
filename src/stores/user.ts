import {defineStore} from 'pinia';
import axios from '../plugins/axios';

type LoginRequest = {
    email: string;
    password: string;
}
type CreateUserRequest = {
    email: string,
    username: string,
    password: string,
    role_input: 'admin' | 'manager' | 'user',
    firstname?: string,
    lastname?: string,
    gender?: 0 | 1,
}
type UpdateUserRequest = {
    id: number;
    data: Partial<CreateUserRequest>
}
type GetUserInfoRequest = {}
type ViewUserRequest = {
    id: number;
}
type GetListUserRequest = {
    [key: string]: any;
}
type DeleteUserRequest = {
    id: number;
}
export const useUserStore = defineStore('userStore', {
    state: () => ({
        accessToken: null as any,
        userInfo: null as any,
        listUser: [] as any,
        listUserMeta: {} as any,
    }),
    getters: {
        isLogin(state) {
            return state.userInfo !== null;
        }
    },
    actions: {
        login(data: LoginRequest): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/v1/admin/user/item/login', data);
                    this.accessToken = response.data.data.user.token;
                    localStorage.setItem('access_token', this.accessToken);
                    await this.getUserInfo();
                    (this as any).router.push('/');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        logout() {
            this.userInfo = null;
            this.accessToken = null;
            localStorage.removeItem('access_token');
            (this as any).router.push({name: 'Login'});
        },
        getUserInfo(): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post('/api/v1/admin/user/item/me');
                    this.userInfo = response.data.data.user;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        createUser(data: CreateUserRequest): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios.post('/api/v1/admin/user/item/create', data);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        updateUser({id, data}: UpdateUserRequest): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios.post('/api/v1/admin/user/item/update', data, {
                        params: {
                            id: id
                        }
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        deleteUser({id}: DeleteUserRequest): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios.delete('/api/v1/admin/user/item/delete', {
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
        getListUser(params?: GetListUserRequest): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    // this.listUser = [];
                    // this.listUserMeta = {};
                    const response = await axios.get('/api/v1/admin/user/item', {
                        params,
                    });
                    this.listUser = response.data.data.items;
                    this.listUserMeta = response.data.data._meta;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        viewUserInfo(params: ViewUserRequest): Promise<any> {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.get('/api/v1/admin/user/item', {
                        params
                    });
                    resolve(response?.data?.data);
                } catch (error) {
                    reject(error);
                }
            })
        }
    },
});
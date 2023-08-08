import {createApp, markRaw} from 'vue';
import App from './App.vue';
import router from "./router";
import {createPinia} from "pinia";
import './styles/tailwind.scss';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import './styles/index.scss';

const pinia = createPinia();
pinia.use(({ store }) => { store.router = markRaw(router) })
const app = createApp(App);
app.use(Antd);
app.use(router);
app.use(pinia);
app.mount('#app');

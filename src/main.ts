import { createApp } from 'vue';
import VueCodemirror from 'vue-codemirror';
import App from './App.vue';
import './assets/styles/main.css';
import { initializePersistence } from './core/storage';

void initializePersistence();

const app = createApp(App);
app.use(VueCodemirror, { extensions: [] });
app.mount('#app');

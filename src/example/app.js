import Vue from 'vue';
import VueifiedDataTables from '../vueifiedDataTables/js/vueifiedDataTables';

Vue.use(VueifiedDataTables);

const app = new Vue({
    el: '#app',
    data: {
        url: 'http://192.168.1.2/Projects/TLF/public/dtSample',
        columns: [
            {
                key: 'id',
                title: 'ID',
            },
            {
                key: 'project_id',
                title: 'Project ID',
            },
            {
                key: 'name',
                title: 'Name',
            },
            {
                key: 'created_at',
                title: 'Created',
            },
        ],
        config: {
            footer: !true,
        },
    },
});
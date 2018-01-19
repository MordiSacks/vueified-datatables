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
                render(value, row){
                    return value;
                },
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

                component(value, row) {
                    return {
                        template: `<div>gdsgds</div>`,
                    };
                },
            },
        ],
        config: {
            footer: !true,
        },
    },
});
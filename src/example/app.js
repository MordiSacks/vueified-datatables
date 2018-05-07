import Vue from 'vue';
import VueifiedDataTables from '../VueifiedDataTables';
import VueifiedDataTablesHE from '../translations/he';

Vue.use(VueifiedDataTables);

const app = new Vue({
    el: '#app',
    data: {
        url: 'https://example.com',
        columns: [
            {
                data: 'id',
                title: 'ID',
                component(val, row) {
                    return {
                        data() {
                            return {
                                val,
                            };
                        },
                        template: `<div @click="$parent.$parent.a(val)" v-text="val"></div>`,
                    };
                },
            },
            {
                data: 'full_name',
                name: 'full_name',
                title: 'Full Name',
                searchable: true,
                orderable: true,
                render(val, row) {
                    return val.split('').join('-');
                },
            },
            {
                data: 'address',
                title: 'Address',
            },
            {
                data: 'created_at',
                title: 'Date',
            },
        ],
        options: {
            language: VueifiedDataTablesHE,
            search: true,
            header: true,
            footer: false,
            firstLast: true,
            rowsPerPage: 10,
            availableRowsPerPage: [
                10,
                25,
                50,
                100,
            ],
        },

    },

    methods: {
        a(val) {
            alert(val);
        },
    },
});
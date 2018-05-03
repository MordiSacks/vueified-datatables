import Vue from 'vue';
import VueifiedDataTables from '../vueifiedDataTables/js/vueifiedDataTables';

Vue.use(VueifiedDataTables);

const app = new Vue({
    el: '#app',
    data: {
        url: 'https://exmaple.com/json',
        columns: [
            {
                key: 'full_name',
                title: 'Name',
            },
            {
                key: 'Budget',
                title: 'Budget',
            },
            {
                key: 'phone_numbers',
                name: 'lead_phone_numbers.phone_number',
                title: 'Phone Numbers',
                render(value, row) {
                    if (!Array.isArray(value)) {
                        return 'N/A';
                    }

                    if (value.length === 1) {
                        return `<span>${value[0].phone_number}</span>`;
                    }

                    let response = '';

                    for (let i = 0; i < value.length; i++) {
                        response += `
                                    <span style="text-transform: capitalize">${value[i].label}:</span>
                                    <span>${value[i].phone_number}</span>,
                                    `;
                    }

                    return response;
                },
            },
            {
                key: 'emails',
                title: 'Emails',
                render(value, row) {
                    if (!Array.isArray(value)) {
                        return 'N/A';
                    }

                    if (value.length === 1) {
                        return `<span>${value[0].email}</span>`;
                    }

                    let response = '';

                    for (let i = 0; i < value.length; i++) {
                        response += `
                                    <span style="text-transform: capitalize">${value[i].label}:</span>
                                    <span>${value[i].email}</span>,
                                    `;
                    }

                    return response;
                },
            },
            {
                key: 'created_at',
                title: 'Date',
            },
        ],
        columnsOld: [
            {
                key: 'id',
                title: 'ID',
                render(value, row) {
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
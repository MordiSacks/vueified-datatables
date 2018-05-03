<template>
    <div :dir="currentLanguage.direction" class="vueified-datatable">

        <!-- Table header controls -->
        <div class="vueified-datatable-header-controls">

            <!-- Results per page -->
            <div v-if="config.configRowsPerPage && config.configRowsPerPage.length > 0"
                 class="dataTables_length">
                <label>
                    {{ _('Show _MENU_ entries').match(/(.*)_MENU_(.*)/)[1] }}
                    <select v-model="request.length">
                        <option v-for="amount in config.configRowsPerPage"
                                :value="amount"
                                v-text="amount"></option>
                    </select>
                    {{ _('Show _MENU_ entries').match(/(.*)_MENU_(.*)/)[2] }}
                </label>
            </div>

            <!-- Header custom content -->
            <div class="dataTables_center">
                <slot name="header"/>
            </div>

            <!-- Search -->
            <div v-if="config.search" class="dataTables_filter">
                <label>
                    {{ _('Search') }} :
                    <input type="search"
                           @input="doSearch"
                           v-model="searchPhrase">
                </label>
            </div>
        </div>

        <!-- Table -->
        <table :class="config.tableClasses">

            <thead v-if="config.header">
            <tr role="row">

                <!--Loop through defined columns -->
                <th v-for="(column, index) in columns"
                    v-text="column.title || column.key || 'N/A'"
                    :class="columnClasses(column ,index)"
                    @click="sortBy(column,index)"></th>
            </tr>
            </thead>

            <tbody>

            <!-- Loop through rows -->
            <tr role="row" v-for="row in (data.data) || []">
                <td v-for="(column, index) in columns"
                    :class="request.order[0].column === index ? 'sorting_1' : ''">
                    <!-- If we have a component function, render the component -->
                    <component v-if="typeof column.component === 'function'"
                               :is="column.component(row[column.key], row)"/>

                    <!-- Else if we have a render function, use it's return value -->
                    <div v-else-if="typeof column.render === 'function'"
                         v-html="column.render(row[column.key], row)"></div>

                    <!-- Else, use column value -->
                    <slot v-else>
                        {{ row[column.key] !== undefined ? row[column.key] : 'N/A' }}
                    </slot>
                </td>
            </tr>

            <!-- If we don't have any rows -->
            <tr v-if="typeof data.data !== 'undefined' && data.data.length === 0">
                <td class="dataTables_empty" :colspan="columns.length">
                    {{ _('No matching records found') }}
                </td>
            </tr>
            </tbody>

            <tfoot v-if="config.footer">
            <tr>
                <th v-for="column in columns" v-text="column.title || column.key || 'N/A'"></th>
            </tr>
            </tfoot>
        </table>

        <!--Table footer controls -->
        <div class="vueified-datatable-footer-controls">

            <!-- Table row stats -->
            <div class="dataTables_info"
                 role="status"
                 aria-live="polite"
                 v-text="showingString"></div>

            <!-- Pagination -->
            <div class="dataTables_paginate paging_simple_numbers">

                <!-- Go to first page -->
                <a class="paginate_button first"
                   v-if="config.firstLast"
                   :class="currentPage === 0 ? 'disabled' : ''"
                   @click="goToPage(0)"
                   tabindex="0">{{ _('First') }}</a>

                <!-- Go to previous page -->
                <a class="paginate_button previous"
                   :class="currentPage === 0 ? 'disabled' : ''"
                   @click="goToPage(currentPage - 1)"
                   tabindex="0">{{ _('Previous') }}</a>

                <!-- All Pages -->
                <span>
                    <a v-for="page in pages"
                       class="paginate_button"
                       @click="goToPage(page)"
                       v-text="page + 1"
                       :class="currentPage === page ? 'current' : ''"
                       tabindex="0"></a>
                </span>

                <!-- Go to next page -->
                <a class="paginate_button next"
                   :class="currentPage === pages[pages.length - 1] ? 'disabled' : ''"
                   @click="goToPage(currentPage + 1)"
                   tabindex="0">{{ _('Next') }}</a>

                <!-- Go to last page -->
                <a class="paginate_button last"
                   v-if="config.firstLast"
                   :class="currentPage === pages[pages.length - 1] ? 'disabled' : ''"
                   @click="goToPage(pages[pages.length - 1])"
                   tabindex="0">{{ _('Last') }}</a>
            </div>
        </div>


        <div v-if="loading" class="dataTables_processing">{{ _('Processing...') }}</div>
    </div>
</template>

<script>
    import jQuery from 'jquery';
    import translations from './translations/translations';

    export default {
        name: 'vueified-datatable',
        props: {
            url: {
                type: String,
                required: true,
            },

            columns: {
                type: Array,
                required: true,
            },

            options: {
                type: Object,
                required: false,
            },
        },
        data() {
            return {
                config: {},
                data: {},
                request: {
                    draw: 0,
                    columns: [],
                    order: [
                        {
                            column: null,
                            dir: null,
                        }
                    ],
                    start: 0,
                    length: 0,
                    search: {
                        value: '',
                        regex: false,
                    }
                },

                searchPhrase: '',
                searchTimeout: null,

                pages: [],
                currentPage: 0,


                translations,
                currentLanguage: {},

                loading: true,
            };
        },
        computed: {
            showingString() {
                let vm = this;

                let result = '';

                /** Replace placeholders with values */
                result += vm._('Showing _START_ to _END_ of _TOTAL_ entries')
                            .replace(/_START_|_END_|_TOTAL_/g, function (match) {
                                switch (match) {
                                    case '_START_':
                                        return (vm.request.start + 1);

                                    case '_END_':
                                        if (vm.data.recordsFiltered === vm.data.recordsTotal) {
                                            return (
                                                vm.request.start + vm.request.length > vm.data.recordsTotal
                                                    ? vm.data.recordsTotal
                                                    : (vm.request.start + vm.request.length)
                                            );
                                        } else {
                                            return (
                                                vm.request.start + vm.request.length > vm.data.recordsFiltered
                                                    ? vm.data.recordsFiltered
                                                    : (vm.request.start + vm.request.length)
                                            );
                                        }

                                    case '_TOTAL_':
                                        if (vm.data.recordsFiltered === vm.data.recordsTotal) {
                                            return vm.data.recordsTotal;
                                        } else {
                                            return vm.data.recordsFiltered;
                                        }

                                }
                            });

                /** If results are filtered */
                if (vm.data.recordsFiltered !== vm.data.recordsTotal) {
                    result += ' ' + vm._('(filtered from _MAX_ total entries)')
                                      .replace('_MAX_', vm.data.recordsTotal);
                }

                return result;
            },
        },
        watch: {
            /** On every change of the request object, reload the table */
            request: {
                handler() {
                    this.draw++;
                    this.loadData();
                },
                deep: true,
            },
        },
        created() {
            /** Load Configuration */
            this.loadConfig();

            /** Load language */
            this.loadLanguage();
        },
        mounted() {

            /** Load the table */
            this.loadData();
        },

        methods: {
            /**
             * Merge the provided options with the default configuration
             */
            loadConfig() {
                this.config = Object.assign({
                    language: 'en',
                    rowsPerPage: 10,
                    configRowsPerPage: [
                        10,
                        25,
                        50,
                        100,
                    ],
                    tableClasses: '',
                    firstLast: false,
                    search: true,
                    header: true,
                    footer: false,
                }, this.options || {});

                this.request.length = this.config.rowsPerPage;
            },

            loadLanguage() {
                if (typeof this.config.language === 'object') {
                    this.currentLanguage.direction = this.config.language.direction || this.translations.en.direction;
                    this.currentLanguage.strings   = Object.assign(this.translations.en.strings, this.config.language.strings);
                } else {
                    this.currentLanguage = this.translations[this.config.language];
                }
            },

            getPreparedRequest() {
                let vm      = this;
                let request = JSON.parse(JSON.stringify(vm.request));

                request.columns = vm.columns.map(column => {
                    return {
                        data: column.key,
                        name: column.name || null,
                        searchable: typeof column.searchable === 'undefined' ? true : column.searchable,
                        orderable: typeof column.orderable === 'undefined' ? true : column.orderable,
                    };
                });

                return request;
            },

            /**
             * Load the table data from the provided URL
             */
            loadData() {
                let vm = this;

                vm.loading = true;

                jQuery.ajax({
                    url: vm.url + '?' + jQuery.param(vm.getPreparedRequest()),
                    type: 'get',
                    dataType: 'json',
                }).done(data => {
                    /** Set the number of pages */
                    vm.pages = [];
                    if (vm.request.length > 0) {
                        for (let i = 0; i < Math.ceil(data.recordsTotal / vm.request.length); i++) {
                            vm.pages.push(i);
                        }
                    } else {
                        vm.pages.push(0);
                    }

                    /** Assign the data */
                    vm.data = data;

                    vm.loading = false;
                });
            },

            /**
             * Search function
             */
            doSearch() {

                /** As the user continued typing, clear the timeout */
                if (this.searchTimeout !== null) {
                    clearInterval(this.searchTimeout);
                }

                /** Set timeout to preform the search in half a second */
                this.searchTimeout = setTimeout(() => {
                    this.request.search.value = this.searchPhrase;
                }, 500);
            },

            /**
             * Sort the table by a specific column
             */
            sortBy(column, index) {

                /** Check if this column is sortable */
                if (typeof column.orderable !== 'undefined' && column.orderable === false) {
                    return;
                }

                /** Figure out the direction of the sorting */
                let dir = 'asc';

                if (
                    this.request.order[0].column === index
                    && this.request.order[0].dir === 'asc'
                ) {
                    dir = 'desc';
                }

                this.request.order = [{
                    column: index,
                    dir: dir,
                }];
            },

            /**
             * Determine what classes the column should have
             */
            columnClasses(column, index) {

                /** If column is being sorted */
                if (this.request.order[0].column === index) {
                    return this.request.order[0].dir === 'desc' ? 'sorting_desc' : 'sorting_asc';
                }


                /** If column is sortable */
                if (typeof column.orderable === 'undefined' || column.orderable === true) {
                    return 'sorting';
                }

                /** Column is not sortable */
                return 'no-sort sorting_disabled';
            },


            /**
             * Go to a page
             */
            goToPage(page) {

                /** Check if page exists */
                if (this.pages.indexOf(page) < 0) {
                    return;
                }

                this.request.start = page * this.request.length;
                this.currentPage   = page;
            },

            /**
             * Translate string
             * @param {String} string
             * @return {String}
             * @private
             */
            _(string) {
                return this.currentLanguage.strings[string] || string;
            },
        },

        /**
         *
         * @param Vue {Vue}
         * @param options {{}}
         */
        install(Vue, options) {
            Vue.component('vueified-datatable', this);
        }
    };
</script>
<template>
    <div :dir="config.language.direction" class="vueified-datatable">

        <!--Header-->
        <div class="vueified-datatable-header">

            <!-- Results per page -->
            <div v-if="config.availableRowsPerPage.length > 0"
                 class="vueified-datatable-rows-per-page">
                <label>
                    {{ _('Show _MENU_ entries').match(/(.*)_MENU_(.*)/)[1] }}
                    <select v-model="config.rowsPerPage">
                        <option v-for="amount in config.availableRowsPerPage"
                                :value="amount"
                                v-text="amount > -1 ? amount : _('All')"></option>
                    </select>
                    {{ _('Show _MENU_ entries').match(/(.*)_MENU_(.*)/)[2] }}
                </label>
            </div>
            <!--/Results per page -->

            <!--Header slot-->
            <div class="vueified-datatable-header-slot">
                <slot name="header"/>
            </div>
            <!--/Header slot-->

            <!-- Search -->
            <div v-if="config.search" class="vueified-datatable-search">
                <label>
                    {{ _('Search') }} :
                    <input type="search" @input="doSearch" v-model="searchPhrase">
                </label>
            </div>

        </div>
        <!--/Header-->

        <table class="vueified-datatable-table" :class="config.tableClasses">
            <thead v-if="config.header">
            <tr>
                <th v-for="(column, i) in columns"
                    :class="columnClasses(column, i)"
                    @click="sortBy(column, i)"
                    v-text="column.title || column.data"></th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="(row, i) in response.data || []">
                <td v-for="(column, ci) in columns">

                    <!-- If we have a component function, render the component -->
                    <component v-if="typeof column.component === 'function'" :row="row"
                               :is="column.component(row[column.data], row)"/>

                    <!-- Else if we have a render function, use it's return value -->
                    <div v-else-if="typeof column.render === 'function'"
                         v-html="column.render(row[column.data], row)"></div>

                    <!-- Else, use column value -->
                    <slot v-else>
                        {{ row[column.data] !== undefined ? row[column.data] : 'N/A' }}
                    </slot>
                </td>
            </tr>

            <!-- If we don't have any rows -->
            <tr v-if="response.data.length === 0">
                <td class="vueified-datatable-no-data" :colspan="columns.length">
                    {{ _('No matching records found') }}
                </td>
            </tr>

            </tbody>

            <tfoot v-if="config.footer">
            <tr>
                <th v-for="(column, i) in columns"
                    :class="columnClasses(column, i)"
                    @click="sortBy(column, i)"
                    v-text="column.title || column.data"></th>
            </tr>
            </tfoot>
        </table>

        <!--Footer-->
        <div class="vueified-datatable-footer">

            <div class="vueified-datatable-showing"
                 v-text="showingString"></div>

            <div class="vueified-datatable-footer-slot">
                <slot name="footer"/>
            </div>

            <div class="vueified-datatable-pagination">

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
        <!--/Footer-->

        <!--Loader-->
        <div class="vueified-datatable-loading-overlay" v-if="loading">
            <div class="vueified-datatable-loading"></div>
        </div>
        <!--/Loader-->
    </div>
</template>

<script>
    import Vue from 'vue';
    import Qs from 'qs';
    import axios from 'axios';
    import EN from './translations/en';

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
                config: {
                    language: EN,
                    headers: {},
                    search: true,
                    header: true,
                    footer: false,
                    firstLast: true,
                    tableClasses: '',
                    rowsPerPage: 10,
                    availableRowsPerPage: [
                        10,
                        25,
                        50,
                        100,
                        -1,
                    ],
                },

                searchPhrase: '',
                searchTimeout: null,

                response: {
                    data: [],
                },

                request: {
                    draw: 0,
                    start: 0,
                    length: 0,
                    search: {
                        value: '',
                        regex: false,
                    },
                    order: [{
                        column: null,
                        dir: null,
                    }],
                    columns: [],
                },

                pages: [],
                currentPage: 0,

                loading: true,
            };
        },

        computed: {
            showingString() {
                let vm     = this;
                let result = '';

                /** Replace placeholders with values */
                result += vm._('Showing _START_ to _END_ of _TOTAL_ entries')
                            .replace(/_START_|_END_|_TOTAL_/g, function (match) {
                                switch (match) {
                                    case '_START_':
                                        return (vm.request.start + 1);
                                    case '_END_':
                                        if (vm.request.length < 0) {
                                            return vm._('All');
                                        } else if (vm.response.recordsFiltered === vm.response.recordsTotal) {
                                            return (
                                                vm.request.start + vm.request.length > vm.response.recordsTotal
                                                    ? vm.response.recordsTotal
                                                    : (vm.request.start + vm.request.length)
                                            );
                                        } else {
                                            return (
                                                vm.request.start + vm.request.length > vm.response.recordsFiltered
                                                    ? vm.response.recordsFiltered
                                                    : (vm.request.start + vm.request.length)
                                            );
                                        }
                                    case '_TOTAL_':
                                        if (vm.response.recordsFiltered === vm.response.recordsTotal) {
                                            return vm.response.recordsTotal;
                                        } else {
                                            return vm.response.recordsFiltered;
                                        }
                                }
                            });

                /** If results are filtered */
                if (vm.response.recordsFiltered !== vm.response.recordsTotal) {
                    result += ' ' + vm._('(filtered from _MAX_ total entries)')
                                      .replace('_MAX_', vm.response.recordsTotal);
                }
                return result;
            }
        },

        watch: {
            'request.draw'() {
                this.makeRequest();
            },

            'config.rowsPerPage'() {
                this.request.length = this.config.rowsPerPage;

                this.request.draw++;
            },
        },

        mounted() {

            /**
             * Merge the provided options with the default configuration
             */
            this.config = Object.assign(this.config, this.options || {});

            this.columns.forEach((column, i) => {
                let res = {};

                res.data = column.data;

                if (column.name) {
                    res.name = column.name;
                }

                res.searchable = typeof column.searchable === 'undefined' ? true : column.searchable;
                res.orderable  = typeof column.orderable === 'undefined' ? true : column.orderable;

                this.request.columns[i] = res;
            });


            this.request.length = this.config.rowsPerPage;

            this.request.draw++;
        },

        methods: {

            makeRequest() {
                let vm = this;

                vm.loading = true;

                axios.get(vm.url, {
                    paramsSerializer: function (params) {
                        return Qs.stringify(params, {arrayFormat: 'indices'})
                    },
                    params: vm.request,
                    headers: vm.config.headers,
                })
                     .then(response => {
                         vm.response = response.data;

                         /** Set the number of pages */
                         vm.pages = [];
                         if (vm.request.length > 0) {
                             for (let i = 0; i < Math.ceil(response.data.recordsTotal / vm.request.length); i++) {
                                 vm.pages.push(i);
                             }
                         } else {
                             vm.pages.push(0);
                         }

                         /** Set current page */
                         this.currentPage = (vm.request.start / vm.request.length);

                         vm.loading = false;
                     })
                     .catch(error => {
                         console.log(error);
                     });
            },

            /**
             * Determine what classes the column should have
             */
            columnClasses(column, index) {
                /** If column is being sorted */
                if (this.request.order[0].column === index) {
                    return 'sortable ' + (this.request.order[0].dir === 'desc' ? 'sorting_desc' : 'sorting_asc');
                }
                /** If column is sortable */
                if (typeof column.orderable === 'undefined' || column.orderable === true) {
                    return 'sortable sorting';
                }
                /** Column is not sortable */
                return 'no-sort sorting_disabled';
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

                this.request.draw++;
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

                this.request.draw++;
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
                    this.request.draw++;
                }, 500);
            },

            /**
             * Translate string
             * @param {String} string
             * @return {String}
             * @private
             */
            _(string) {
                return this.config.language.strings[string] || string;
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

<style lang="scss">
    @keyframes spinAround {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(359deg);
        }
    }

    .vueified-datatable {
        position: relative;
    }

    .vueified-datatable-header,
    .vueified-datatable-footer {
        display: flex;
    }

    .vueified-datatable-header-slot,
    .vueified-datatable-footer-slot {
        flex: 1;
    }

    .vueified-datatable-pagination {
        .paginate_button {
            user-select: none;
            cursor: pointer;

            &.disabled {
                cursor: not-allowed;
                pointer-events: none;
            }
        }

    }

    .vueified-datatable-table {
        border-spacing: 0;
        width: 100%;

        th.sortable {
            cursor: pointer;
            background: no-repeat center right;

            &.sorting {
                background-image: url('https://cdn.datatables.net/1.10.16/images/sort_both.png');
            }

            &.sorting_asc {
                background-image: url('https://cdn.datatables.net/1.10.16/images/sort_asc.png');
            }

            &.sorting_desc {
                background-image: url('https://cdn.datatables.net/1.10.16/images/sort_desc.png');
            }
        }
    }

    .vueified-datatable-loading-overlay {
        display: flex;
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;

        background-color: rgba(0, 0, 0, 0.2);

        .vueified-datatable-loading {
            margin: auto;
            animation: spinAround 500ms infinite linear;
            border-radius: 50%;
            content: "";
            width: 2em;
            height: 2em;
            border: 2px solid #555;
            border-right-color: transparent;
            border-top-color: transparent;
        }
    }

</style>

import VueifiedDataTables from './Components/VueifiedDataTables';

VueifiedDataTables.install = function (Vue) {
    Vue.component('vueified-datatable', VueifiedDataTables);
};

export default VueifiedDataTables;
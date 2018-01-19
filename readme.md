# Vueified DataTables

## Installation
Run  
`yarn add vueified-datatables` or `npm install vueified-datatables`  
In your code
```js
import VueifiedDataTables from 'vueifiedDataTables';

Vue.use(VueifiedDataTables);
```  

Then in your template
```html
<vueified-datatable :url="URL_TO_JSON_DATA" :columns="YOUR_COLUMNS_ARRAY" :options="YOUR_OPTIONS_OBJECT(Optional)"></vueified-datatable>
```
  
### Example of a columns object
```js
let columns = [
    {
        // the key to read from json
        key: 'id',
         
        // the table header (optional, will use key by default)
        title: 'User ID',
        
        // is column sortable {true|false} (optional, true by default)
        sortable: true,
        
        // is column searchable {true|false} (optional, true by default)
        searchable: true,
        
        // Callback, receives cell value and row, should return a vue component, if is set, cell will render the component
        component: function(value, row){
            return {
                template: `<i @click="delete" class="fa fa-trash">`,
            };
        },
    },
    {
        key: 'f_name',
        title: 'First Name',
    },
    {
        key: 'l_name',
        title: 'Last Name',
    },
    {
        key: 'id',
        title: 'Full Name',
        
        // Callback, receives cell value and row, should return string or int
        render: function(value, row){
            return `${row.f_name} ${row.l_name}`;
        },
    },
];
```

Table will try first to run the `component` function,    
then the `render` function, then wil default to the value.


### options
- TODO

## Change log
### 1.1.0
1. Renamed column parameter `template` to `component`.
2. Add `render` column parameter.

### 1.0.1
1. Refactored pagination
2. Added basic stylesheet
3. Updated readme 


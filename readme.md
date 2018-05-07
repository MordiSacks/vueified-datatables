# Vueified DataTables

## Installation
Run  
`yarn add vueified-datatables` or `npm install vueified-datatables`  
In your code
```js
import VueifiedDataTables from 'VueifiedDataTables';

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
        data: 'id',
         
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
```js
let options = {
    // Current values are the defaults.
    
    // Language you can pass an object with your own language, 
    // look in a language file (ins translations folder) for more details
    language: {},
    
    // Number of rows to display by default
    rowsPerPage: 10,
    
    // Optional number of rows (for select by user)
    configRowsPerPage: [
      10,
      25,
      50,
      100,
   ],
   
   // Classes to use in the table element
   tableClasses: '',
   
   // Display first and lat buttons 
   firstLast: false,
   
   // Display the search box
   search: true,
   
   // Display table header
   header: true,
   
   // Display table footer
   footer: false,
};
```
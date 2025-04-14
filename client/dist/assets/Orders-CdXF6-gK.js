import{r as i,h as R,i as D,k as V,m as T,n as F,j as s,T as K,o as M,p,q as _,s as y,t as E,v as b,C as k,B as l,_ as O,b as L,u as z,d as P,$ as H,a0 as $,K as B,I as J,a1 as q}from"./index-V67Iib8C.js";import{C as n,E as I,P as G}from"./Pagination-CWW75XFJ.js";import"./select-CsmTK3g7.js";function U(a){var x;const[u,j]=i.useState([]),[N,f]=i.useState([]),[v,o]=i.useState({}),[g,c]=i.useState({}),h=()=>a.isAdmin?[{id:"select-col",header:()=>s.jsx(k,{checked:a.isAllSelected,onCheckedChange:e=>a.selectAll(e)}),cell:({row:e})=>s.jsx(k,{onCheckedChange:d=>a.setSelectedOrders(d,e.original._id),checked:!!a.selectedOrders.find(d=>d===e.original._id)})},{accessorKey:"orderNo",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["Order Number",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("orderNo")})},{accessorKey:"poNumber",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["PO #",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("poNumber")})},{accessorKey:"deliveryDate",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["Delivery Date",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("deliveryDate")?O(e.getValue("deliveryDate")):"N/A"})},{accessorKey:"pickupLocation",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["Shipping Address",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("pickupLocation")})},{accessorKey:"userId",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["Customer Name",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.original.userId.name})},{accessorKey:"totalPrice",header:()=>s.jsx("div",{className:"text-center",children:"Total Amount"}),cell:({row:e})=>s.jsxs("div",{className:"text-center",children:["$ ",e.getValue("totalPrice").toFixed(2)]})},{id:"actions",header:()=>s.jsx("div",{className:"text-center",children:"Actions"}),enableHiding:!1,cell:({row:e})=>s.jsx("div",{className:"flex items-center justify-center",children:s.jsx(l,{onClick:()=>a.viewOrder(e.original._id),variant:"ghost",size:"icon",className:"h-8 w-8",children:s.jsx(I,{className:"h-4 w-4"})})})}]:[{accessorKey:"orderNo",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["Order Number",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("orderNo")})},{accessorKey:"poNumber",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["PO #",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("poNumber")})},{accessorKey:"deliveryDate",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["Delivery Date",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("deliveryDate")?O(e.getValue("deliveryDate")):"N/A"})},{accessorKey:"pickupLocation",header:({column:e})=>s.jsxs(l,{variant:"ghost",onClick:()=>e.toggleSorting(e.getIsSorted()==="asc"),className:"flex items-center gap-2",children:["Shipping Address",s.jsx(n,{className:"h-4 w-4"})]}),cell:({row:e})=>s.jsx("div",{className:"ms-4",children:e.getValue("pickupLocation")})},{accessorKey:"totalPrice",header:()=>s.jsx("div",{className:"text-center",children:"Total Amount"}),cell:({row:e})=>s.jsxs("div",{className:"text-center",children:["$ ",e.getValue("totalPrice")]})},{id:"actions",header:()=>s.jsx("div",{className:"text-center",children:"Actions"}),enableHiding:!1,cell:({row:e})=>s.jsx("div",{className:"flex items-center justify-center",children:s.jsx(l,{onClick:()=>a.viewOrder(e.original._id),variant:"ghost",size:"icon",className:"h-8 w-8",children:s.jsx(I,{className:"h-4 w-4"})})})}],m=R({data:a.orders,columns:h(),onSortingChange:j,onColumnFiltersChange:f,getCoreRowModel:D(),getPaginationRowModel:V(),getSortedRowModel:T(),getFilteredRowModel:F(),onColumnVisibilityChange:o,onRowSelectionChange:c,globalFilterFn:(r,e,d)=>{const t=r.getValue(e);return typeof t=="string"?t.toLowerCase().includes(d.toLowerCase()):typeof t=="number"?t.toString().includes(d):!1},onGlobalFilterChange:a.setFilterText,state:{globalFilter:a.filterText,sorting:u,columnFilters:N,columnVisibility:v,rowSelection:g,pagination:{pageIndex:a.pageIndex-1,pageSize:a.pageSize}}});return s.jsx("div",{className:"w-full",children:s.jsx("div",{className:"rounded-lg border",children:s.jsxs(K,{children:[s.jsx(M,{children:m.getHeaderGroups().map(r=>s.jsx(p,{children:r.headers.map(e=>s.jsx(_,{children:e.isPlaceholder?null:y(e.column.columnDef.header,e.getContext())},e.id))},r.id))}),s.jsx(E,{children:(x=m.getRowModel().rows)!=null&&x.length?m.getRowModel().rows.map(r=>s.jsx(p,{"data-state":r.getIsSelected()&&"selected",className:"",children:r.getVisibleCells().map(e=>s.jsx(b,{children:y(e.column.columnDef.cell,e.getContext())},e.id))},r.id)):s.jsx(p,{children:s.jsx(b,{colSpan:h().length,className:"h-24 text-center",children:"No results."})})})]})})})}const Y=()=>{const a=L(),u=z(),[j,N]=i.useState(""),[f,v]=i.useState(!1),[o,g]=i.useState([]),{user:c}=P(t=>t.auth),{orders:h,loading:m}=P(t=>t.order);i.useEffect(()=>{c&&(c.admin?a(H({})):a($({userId:c._id})))},[c]);const[x,r]=i.useState(1),[e,d]=i.useState(30);return s.jsxs("div",{className:"p-6",children:[s.jsx(B,{show:m,fullScreen:!0}),s.jsxs("div",{className:"flex gap-6 mb-6",children:[s.jsxs("div",{className:"relative w-full",children:[s.jsx(J,{value:j,onChange:t=>N(t.target.value),type:"text",placeholder:"Search",className:"focus-visible:outline-none ps-10 !h-10"}),s.jsx("div",{className:"absolute top-1/2 -translate-y-1/2 left-5",children:s.jsx("img",{src:"icons/search.svg",alt:"search"})})]}),!c.admin&&s.jsx(l,{onClick:()=>u("/create-order"),className:"px-[22px] ml-auto",children:"Create Order"}),c.admin&&o.length>0&&s.jsx(l,{onClick:()=>a(q({orderIds:o})),className:"px-[22px] ml-auto",children:"Export Orders"})]}),s.jsxs("div",{className:"relative",children:[s.jsx(U,{pageIndex:x,pageSize:e,filterText:j,setFilterText:N,isAdmin:c.admin,viewOrder:t=>u(`/view-order/${t}`),orders:h,isAllSelected:f,selectAll:t=>{if(t){v(!0);const S=h.map(C=>C._id);g(S)}else v(!1),g([])},setSelectedOrders:(t,S)=>{if(t)g([...o,S]);else{const C=o.findIndex(A=>A===S),w=JSON.parse(JSON.stringify(o));w.splice(C,1),g(w)}},selectedOrders:o}),s.jsx(G,{currentPage:x,totalPages:Math.ceil(h.length/e),rowsPerPage:e,onPageChange:r,onRowsPerPageChange:t=>{d(t),r(1)}})]})]})};export{Y as default};

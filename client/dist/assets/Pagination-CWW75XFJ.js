import{Q as c,j as e,B as d}from"./index-V67Iib8C.js";import{S as x,a as r,b as m,c as o,d as a,C as p,e as j}from"./select-CsmTK3g7.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=c("ChevronsLeft",[["path",{d:"m11 17-5-5 5-5",key:"13zhaf"}],["path",{d:"m18 17-5-5 5-5",key:"h8a8et"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=c("ChevronsRight",[["path",{d:"m6 17 5-5-5-5",key:"xnjwq"}],["path",{d:"m13 17 5-5-5-5",key:"17xmmf"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=c("ChevronsUpDown",[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=c("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);function C({currentPage:s,totalPages:l,rowsPerPage:n,onPageChange:i,onRowsPerPageChange:t}){return e.jsxs("div",{className:"flex items-center justify-between py-6",children:[e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsx("span",{className:"text-sm font-medium",children:"Rows per page"}),e.jsxs(x,{value:n.toString(),onValueChange:h=>t(Number(h)),children:[e.jsx(r,{className:"w-[70px] shadow-[0px_2px_4px_0px_rgba(30,41,59,0.25)]",children:e.jsx(m,{children:n})}),e.jsxs(o,{children:[e.jsx(a,{value:"10",children:"10"}),e.jsx(a,{value:"20",children:"20"}),e.jsx(a,{value:"30",children:"30"}),e.jsx(a,{value:"40",children:"40"}),e.jsx(a,{value:"50",children:"50"})]})]})]}),e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsxs("div",{className:"text-sm font-medium",children:["Page ",s," of ",l]}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx(d,{variant:"outline",onClick:()=>i(1),disabled:s===1,className:"p-2 h-8 w-8 rounded-lg disabled:opacity-50",children:e.jsx(v,{className:"w-4 h-4"})}),e.jsx(d,{variant:"outline",onClick:()=>i(s-1),disabled:s===1,className:"p-2 h-8 w-8 rounded-lg disabled:opacity-50",children:e.jsx(p,{className:"w-4 h-4"})}),e.jsx(d,{onClick:()=>i(s+1),disabled:s===l,className:"p-2 h-8 w-8 rounded-lg disabled:opacity-50",children:e.jsx(j,{className:"w-4 h-4"})}),e.jsx(d,{onClick:()=>i(l),disabled:s===l,className:"p-2 h-8 w-8 rounded-lg disabled:opacity-50",children:e.jsx(f,{className:"w-4 h-4"})})]})]})]})}export{N as C,w as E,C as P};

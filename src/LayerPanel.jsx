import React from 'react';

export default function LayerPanel({canvas,layers,selectedId,touch}){
const {LayerRow}=window.EasyEditDesignSystem_1140d6;
const [renamingId,setRenamingId]=React.useState(null);
const [renameVal,setRenameVal]=React.useState('');
const dragIndexRef=React.useRef(null);
function findObj(id){return canvas.getObjects().find(o=>o._studioId===id);}
function selectLayer(id){const o=findObj(id);if(!o||o._locked)return;canvas.setActiveObject(o);canvas.requestRenderAll();}
function toggleVisible(id){const o=findObj(id);if(!o)return;o.visible=!o.visible;touch(o);}
function toggleLock(id){const o=findObj(id);if(!o)return;o._locked=!o._locked;o.selectable=!o._locked;o.evented=!o._locked;touch(o);}
function commitRename(id){const o=findObj(id);if(o&&renameVal.trim())o._studioName=renameVal.trim();setRenamingId(null);if(o)touch(o);}
function onDrop(targetIdx){
const from=dragIndexRef.current;if(from===null||from===targetIdx)return;
const arr=layers.slice();const [moved]=arr.splice(from,1);arr.splice(targetIdx,0,moved);
const objs=arr.map(l=>findObj(l.id)).reverse();
canvas._objects=objs;
canvas.requestRenderAll();
canvas.fire('object:modified',{target:canvas.getActiveObject()});
}
return (
<div style={{height:176,flexShrink:0,borderTop:'1px solid var(--border-default,#e5e7eb)',background:'var(--surface-canvas,#141518)',display:'flex',flexDirection:'column'}}>
<div style={{padding:'8px 14px',fontFamily:'var(--font-mono)',fontSize:'var(--size-label)',letterSpacing:'var(--tr-label)',textTransform:'uppercase',color:'var(--text-inverse-secondary)',borderBottom:'1px solid var(--border-dark)'}}>Layers</div>
<div style={{flex:1,overflowY:'auto',padding:'6px 10px',display:'flex',flexDirection:'column',gap:2}}>
{layers.length===0&&<div style={{color:'var(--text-inverse-secondary)',fontSize:13,padding:'12px 4px'}}>No layers yet — add a shape, image, or text to get started.</div>}
{layers.map((l,i)=>(
<div key={l.id} draggable onDragStart={()=>dragIndexRef.current=i} onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(i)} onDoubleClick={()=>{setRenamingId(l.id);setRenameVal(l.name);}}>
{renamingId===l.id?
<input autoFocus value={renameVal} onChange={e=>setRenameVal(e.target.value)} onBlur={()=>commitRename(l.id)} onKeyDown={e=>{if(e.key==='Enter')commitRename(l.id);}} style={{width:'100%',boxSizing:'border-box',fontFamily:'var(--font-body)',fontSize:13,padding:'8px 10px',borderRadius:'var(--radius-sm)',border:'1px solid var(--accent-primary)',background:'#1c1e23',color:'#fff'}}/>
:<LayerRow name={l.name} visible={l.visible} locked={l.locked} selected={l.id===selectedId} onSelect={()=>selectLayer(l.id)} onToggleVisible={()=>toggleVisible(l.id)} onToggleLock={()=>toggleLock(l.id)}/>}
</div>
))}
</div>
</div>);
}

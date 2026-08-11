import React from 'react';

export default function TopBar({projectName,setProjectName,onUndo,onRedo,onSave,onPreview,onExport,dirty,templateName}){
const {IconButton,Button,Badge}=window.EasyEditDesignSystem_1140d6;
const [exportOpen,setExportOpen]=React.useState(false);
const [editingName,setEditingName]=React.useState(false);
const [nameVal,setNameVal]=React.useState(projectName);
return (
<div style={{height:56,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:'1px solid var(--border-default)',background:'var(--surface-panel,#fff)'}}>
<div style={{display:'flex',alignItems:'center',gap:10}}>
{editingName?
<input autoFocus value={nameVal} onChange={e=>setNameVal(e.target.value)} onBlur={()=>{setProjectName(nameVal||'Untitled Project');setEditingName(false);}} onKeyDown={e=>{if(e.key==='Enter')e.target.blur();}} style={{fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,padding:'6px 10px',borderRadius:'var(--radius-sm)',border:'1px solid var(--border-default)',textAlign:'center'}}/>
:<span onClick={()=>{setNameVal(projectName);setEditingName(true);}} style={{fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,color:'var(--text-primary)',cursor:'text',padding:'6px 4px'}}>{projectName}</span>}
{templateName&&<Badge tone="neutral">{templateName}</Badge>}
</div>
<div style={{display:'flex',alignItems:'center',gap:6}}>
<IconButton icon="↶" label="Undo" onClick={onUndo}/>
<IconButton icon="↷" label="Redo" onClick={onRedo}/>
<div style={{width:1,height:20,background:'var(--border-default)',margin:'0 4px'}}/>
<span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text-secondary)',marginRight:6}}>
<span style={{width:6,height:6,borderRadius:'50%',background:dirty?'#d99a1b':'#1ea672',display:'inline-block'}}/>
{dirty?'Unsaved changes':'All changes saved'}
</span>
<Button variant="secondary" size="sm" onClick={onSave}>Save</Button>
<Button variant="secondary" size="sm" onClick={onPreview}>Preview</Button>
<div style={{position:'relative'}}>
<Button variant="primary" size="sm" onClick={()=>setExportOpen(v=>!v)}>Export</Button>
{exportOpen&&<div style={{position:'absolute',right:0,top:'calc(100% + 6px)',background:'var(--surface-panel,#fff)',border:'1px solid var(--border-default)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-md)',padding:4,display:'flex',flexDirection:'column',minWidth:150,zIndex:30}}>
{['PDF','PNG','JPG'].map(f=><button key={f} onClick={()=>{onExport(f);setExportOpen(false);}} style={{textAlign:'left',padding:'8px 10px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,color:'var(--text-primary)',borderRadius:'var(--radius-xs)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Export {f}</button>)}
</div>}
</div>
</div>
</div>);
}

import React from 'react';
import { STUDIO_DATA } from './data.js';

function AssetShapeIcon({shape,color}){
const s={width:22,height:22,background:color};
if(shape==='circle'||shape==='dot')return <div style={{...s,width:shape==='dot'?10:22,height:shape==='dot'?10:22,borderRadius:'50%'}}/>;
if(shape==='triangle')return <div style={{width:0,height:0,borderLeft:'11px solid transparent',borderRight:'11px solid transparent',borderBottom:`19px solid ${color}`}}/>;
if(shape==='diamond')return <div style={{...s,transform:'rotate(45deg)'}}/>;
if(shape==='stripe')return <div style={{width:28,height:8,background:color}}/>;
if(shape==='ring')return <div style={{width:20,height:20,borderRadius:'50%',border:`3px solid ${color}`}}/>;
if(shape==='line')return <div style={{width:26,height:3,background:color}}/>;
return <div style={s}/>;
}
export default function LeftSidebar({tool,setTool,onAddAsset,onSelectTemplate,width=288}){
const {Tabs,Card}=window.EasyEditDesignSystem_1140d6;
const {TOOLS,ASSET_TABS,ASSETS,TEMPLATES}=STUDIO_DATA;
const [assetTab,setAssetTab]=React.useState('Images');
const items=ASSETS[assetTab]||[];
return (
<div style={{width,flexShrink:0,borderRight:'1px solid var(--border-default)',background:'var(--surface-panel,#fff)',display:'flex',flexDirection:'column',overflowY:'auto'}}>
<div style={{padding:14,display:'flex',flexDirection:'column',gap:4,borderBottom:'1px solid var(--border-default)'}}>
{TOOLS.map(t=>{
const active=tool===t.id;
return <button key={t.id} title={`${t.label} (${t.shortcut})`} onClick={()=>setTool(t.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',border:'none',borderRadius:'var(--radius-sm)',background:active?'var(--accent-primary)':'transparent',color:active?'var(--text-on-accent)':'var(--text-primary)',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:13,fontWeight:500,textAlign:'left'}}
onMouseEnter={e=>{if(!active)e.currentTarget.style.background='var(--gray-100)';}}
onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
<span style={{width:20,textAlign:'center',fontSize:15}}>{t.icon}</span>{t.label}
</button>;
})}
</div>
<div style={{padding:14,display:'flex',flexDirection:'column',gap:10,borderBottom:'1px solid var(--border-default)'}}>
<div style={{fontFamily:'var(--font-mono)',fontSize:'var(--size-label)',letterSpacing:'var(--tr-label)',textTransform:'uppercase',color:'var(--text-secondary)'}}>Assets</div>
<Tabs tabs={ASSET_TABS} value={assetTab} onChange={setAssetTab}/>
{items.length===0?
<div style={{fontSize:13,color:'var(--text-secondary)',padding:'8px 2px'}}>No saved assets yet. Assets you save will appear here.</div>
:<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
{items.map(it=>(
<button key={it.id} onClick={()=>onAddAsset(assetTab,it)} title={it.name} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:8,border:'1px solid var(--border-default)',borderRadius:'var(--radius-sm)',background:'var(--gray-0,#fff)',cursor:'pointer'}}>
<div style={{width:'100%',height:44,borderRadius:'var(--radius-xs)',background:'var(--gray-50,#f5f6f8)',display:'flex',alignItems:'center',justifyContent:'center'}}>
{assetTab==='Images'?<div style={{width:'70%',height:'70%',borderRadius:4,background:it.color}}/>:<AssetShapeIcon shape={it.shape} color={it.color}/>}
</div>
<span style={{fontSize:11,color:'var(--text-secondary)'}}>{it.name}</span>
</button>
))}
</div>}
</div>
<div style={{padding:14,display:'flex',flexDirection:'column',gap:10}}>
<div style={{fontFamily:'var(--font-mono)',fontSize:'var(--size-label)',letterSpacing:'var(--tr-label)',textTransform:'uppercase',color:'var(--text-secondary)'}}>Templates</div>
{TEMPLATES.map(t=>(
<Card key={t.id} onClick={()=>onSelectTemplate(t)}>
<div style={{fontWeight:600,fontSize:13,color:'var(--text-primary)'}}>{t.name}</div>
<div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>{t.desc}</div>
</Card>
))}
<div style={{border:'1px dashed var(--border-default)',borderRadius:'var(--radius-md)',padding:12,fontSize:12,color:'var(--text-secondary)',textAlign:'center'}}>More templates coming soon</div>
</div>
</div>);
}

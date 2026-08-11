import React from 'react';
import * as StudioEngine from './engine.js';
import { STUDIO_DATA } from './data.js';

function LayerActions({layerOp,duplicate,remove}){
const {Panel,Button}=window.EasyEditDesignSystem_1140d6;
return (
<Panel title="Layer">
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
<Button variant="secondary" size="sm" onClick={()=>layerOp('forward')}>Bring Forward</Button>
<Button variant="secondary" size="sm" onClick={()=>layerOp('front')}>Bring to Front</Button>
<Button variant="secondary" size="sm" onClick={()=>layerOp('backward')}>Send Backward</Button>
<Button variant="secondary" size="sm" onClick={()=>layerOp('back')}>Send to Back</Button>
<Button variant="secondary" size="sm" onClick={duplicate}>Duplicate</Button>
<Button variant="ghost" size="sm" onClick={remove}>Delete</Button>
</div>
</Panel>);
}
export default function RightPanel({canvas,selection,docSize,setDocSize,docBg,setDocBg,snapCenter,setSnapCenter,snapObjects,setSnapObjects,grid,setGrid,touch}){
const {Panel,Input,Select,Checkbox,ColorSwatch,Switch}=window.EasyEditDesignSystem_1140d6;
const {MATERIALS,COLOR_PRESETS,FONTS}=STUDIO_DATA;
function obj(){return canvas&&canvas.getActiveObject();}
function setTransform(patch){const o=obj();if(!o)return;
if('width' in patch)o.set('scaleX',patch.width/(o.width||1));
if('height' in patch)o.set('scaleY',patch.height/(o.height||1));
['left','top','angle'].forEach(k=>{if(k in patch)o.set(k,patch[k]);});
if('opacity' in patch)o.set('opacity',patch.opacity/100);
touch(o);
}
function toggleFlip(axis){const o=obj();if(!o)return;o.set(axis,!o[axis]);touch(o);}
function applyColor(hex){const o=obj();if(!o)return;
if(o.type==='image'){const F=StudioEngine.getBlendColorFilter();if(F){o.filters=[new F({color:hex,mode:'tint',alpha:0.6})];o.applyFilters();}o._baseColor=hex;}
else{o._baseColor=hex;o.set('fill',StudioEngine.makeFill(o._material||'Flat',hex));}
touch(o);
}
function applyMaterial(mat){const o=obj();if(!o||o.type==='image')return;o._material=mat;o.set('fill',StudioEngine.makeFill(mat,o._baseColor||'#4f5bd5'));touch(o);}
function applyBlend(mode){const o=obj();if(!o)return;o.set('globalCompositeOperation',mode==='normal'?undefined:mode);touch(o);}
function layerOp(op){const o=obj();if(!o)return;
if(op==='forward')canvas.bringForward(o);
if(op==='front')canvas.bringToFront(o);
if(op==='backward')canvas.sendBackwards(o);
if(op==='back')canvas.sendToBack(o);
touch(o);
}
function duplicate(){const o=obj();if(!o)return;o.clone(cl=>{cl.set({left:o.left+24,top:o.top+24});cl._studioId=StudioEngine.nextId();cl._studioName=o._studioName+' copy';cl._studioType=o._studioType;cl._material=o._material;cl._baseColor=o._baseColor;cl._locked=false;canvas.add(cl);canvas.setActiveObject(cl);canvas.requestRenderAll();});}
function remove(){const o=obj();if(!o)return;canvas.remove(o);canvas.discardActiveObject();canvas.requestRenderAll();}
function applyText(patch){const o=obj();if(!o)return;
if('text' in patch)o.set('text',patch.text);
if('fontFamily' in patch)o.set('fontFamily',patch.fontFamily);
if('fontSize' in patch)o.set('fontSize',patch.fontSize);
if('fontWeight' in patch)o.set('fontWeight',patch.fontWeight);
if('textAlign' in patch)o.set('textAlign',patch.textAlign);
touch(o);
}

const label={fontFamily:'var(--font-mono)',fontSize:'var(--size-label)',letterSpacing:'var(--tr-label)',textTransform:'uppercase',color:'var(--text-secondary)',margin:'2px 0 6px'};
const fieldRow={display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:8};

let body;
if(!selection){
body=(
<div style={{display:'flex',flexDirection:'column',gap:16}}>
<Panel title="Document">
<div style={{display:'flex',flexDirection:'column',gap:12}}>
<div style={fieldRow}>
<Input label="Width" type="number" value={docSize.w} onChange={e=>setDocSize({w:+e.target.value||1})}/>
<Input label="Height" type="number" value={docSize.h} onChange={e=>setDocSize({h:+e.target.value||1})}/>
</div>
<div>
<div style={label}>Background</div>
<div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
{['#ffffff','#f5f6f8','#17191c'].map(c=><ColorSwatch key={c} color={c} selected={docBg===c} onClick={()=>setDocBg(c)}/>)}
<input type="color" value={docBg} onChange={e=>setDocBg(e.target.value)} style={{width:28,height:28,border:'none',padding:0,background:'none',cursor:'pointer'}}/>
</div>
</div>
</div>
</Panel>
<Panel title="Snap">
<div style={{display:'flex',flexDirection:'column',gap:10}}>
<Checkbox checked={snapCenter} onChange={setSnapCenter} label="Snap to center"/>
<Checkbox checked={snapObjects} onChange={setSnapObjects} label="Snap to objects"/>
<Checkbox checked={grid} onChange={setGrid} label="Grid"/>
</div>
</Panel>
</div>);
}else if(selection.type==='text'){
body=(
<div style={{display:'flex',flexDirection:'column',gap:16}}>
<Panel title="Text">
<div style={{display:'flex',flexDirection:'column',gap:12}}>
<Input label="Content" value={selection.text||''} onChange={e=>applyText({text:e.target.value})}/>
<Select label="Font" options={FONTS} value={(selection.fontFamily||'Inter').split(',')[0].trim()} onChange={e=>applyText({fontFamily:e.target.value})}/>
<div style={fieldRow}>
<Input label="Size" type="number" value={selection.fontSize||32} onChange={e=>applyText({fontSize:+e.target.value||1})}/>
<Select label="Weight" options={['Normal','Bold']} value={(selection.fontWeight==='700'||selection.fontWeight===700)?'Bold':'Normal'} onChange={e=>applyText({fontWeight:e.target.value==='Bold'?'700':'400'})}/>
</div>
<div>
<div style={label}>Alignment</div>
<div style={{display:'flex',gap:6}}>
{['left','center','right'].map(a=><button key={a} onClick={()=>applyText({textAlign:a})} style={{flex:1,padding:'6px 0',border:'1px solid var(--border-default)',borderRadius:'var(--radius-sm)',background:selection.textAlign===a?'var(--accent-primary)':'var(--gray-0)',color:selection.textAlign===a?'var(--text-on-accent)':'var(--text-primary)',cursor:'pointer',textTransform:'capitalize',fontSize:12}}>{a}</button>)}
</div>
</div>
<div>
<div style={label}>Color</div>
<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{COLOR_PRESETS.map(c=><ColorSwatch key={c} color={c} selected={selection.fill===c} onClick={()=>applyColor(c)}/>)}<input type="color" value={selection.fill} onChange={e=>applyColor(e.target.value)} style={{width:28,height:28,border:'none',padding:0,background:'none',cursor:'pointer'}}/></div>
</div>
<Input label="Opacity" type="number" value={selection.opacity} onChange={e=>setTransform({opacity:+e.target.value})}/>
</div>
</Panel>
<LayerActions layerOp={layerOp} duplicate={duplicate} remove={remove}/>
</div>);
}else{
const isImage=selection.nativeType==='image';
body=(
<div style={{display:'flex',flexDirection:'column',gap:16}}>
<Panel title={isImage?'Image':'Shape'}>
<div style={{display:'flex',flexDirection:'column',gap:12}}>
<div style={label}>Transform</div>
<div style={fieldRow}>
<Input label="X" type="number" value={selection.x} onChange={e=>setTransform({left:+e.target.value})}/>
<Input label="Y" type="number" value={selection.y} onChange={e=>setTransform({top:+e.target.value})}/>
</div>
<div style={fieldRow}>
<Input label="Width" type="number" value={selection.w} onChange={e=>setTransform({width:+e.target.value})}/>
<Input label="Height" type="number" value={selection.h} onChange={e=>setTransform({height:+e.target.value})}/>
</div>
<div style={fieldRow}>
<Input label="Rotation" type="number" value={selection.angle} onChange={e=>setTransform({angle:+e.target.value})}/>
<Input label="Opacity" type="number" value={selection.opacity} onChange={e=>setTransform({opacity:+e.target.value})}/>
</div>
<div style={label}>Flip</div>
<div style={{display:'flex',flexDirection:'column',gap:8}}>
<Switch checked={selection.flipX} onChange={()=>toggleFlip('flipX')} label="Horizontal"/>
<Switch checked={selection.flipY} onChange={()=>toggleFlip('flipY')} label="Vertical"/>
</div>
<div style={label}>Appearance</div>
<Select label="Blend mode" options={['Normal','Multiply','Screen','Overlay']} value={selection.blend.charAt(0).toUpperCase()+selection.blend.slice(1)} onChange={e=>applyBlend(e.target.value.toLowerCase())}/>
<div>
<div style={label}>Color</div>
<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{COLOR_PRESETS.map(c=><ColorSwatch key={c} color={c} selected={selection.fill===c} onClick={()=>applyColor(c)}/>)}<input type="color" value={selection.fill} onChange={e=>applyColor(e.target.value)} style={{width:28,height:28,border:'none',padding:0,background:'none',cursor:'pointer'}}/></div>
</div>
<div style={isImage?{opacity:.5,pointerEvents:'none'}:{}}>
<Select label="Material" options={MATERIALS} value={selection.material} onChange={e=>applyMaterial(e.target.value)}/>
</div>
{isImage&&<div style={{fontSize:11,color:'var(--text-secondary)',marginTop:-6}}>Material overlays apply to shape layers.</div>}
</div>
</Panel>
<LayerActions layerOp={layerOp} duplicate={duplicate} remove={remove}/>
</div>);
}

return (
<div style={{flex:1,minHeight:0,padding:14,overflowY:'auto'}}>
{body}
</div>);
}

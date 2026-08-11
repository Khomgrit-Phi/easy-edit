import React from 'react';
import { fabric } from 'fabric';
import * as StudioEngine from './engine.js';

function toolbarBtnStyle(primary){return {border:'none',background:primary?'var(--accent-primary)':'transparent',color:primary?'var(--text-on-accent)':'var(--text-primary)',borderRadius:'var(--radius-sm)',padding:'6px 10px',fontSize:13,cursor:'pointer',fontFamily:'var(--font-body)',whiteSpace:'nowrap'};}
const zoomBtnStyle={width:28,height:28,border:'none',background:'transparent',borderRadius:'var(--radius-pill)',cursor:'pointer',fontSize:15,color:'var(--text-primary)'};

export default function CanvasArea(props){
const {onReady,onSelectionChange,onLayersChange,onDirty,onNotice,docSize,docBg,tool,setTool,grid,snapCenter,snapObjects}=props;
const canvasElRef=React.useRef(null);
const fabricRef=React.useRef(null);
const containerRef=React.useRef(null);
const fileInputRef=React.useRef(null);
const spaceDownRef=React.useRef(false);
const panDragRef=React.useRef(null);
const moveStartRef=React.useRef(null);
const cropGuideRef=React.useRef(null);
const cropTargetRef=React.useRef(null);
const [zoomPct,setZoomPctState]=React.useState(100);
const [panOffset,setPanOffset]=React.useState({x:0,y:0});
const [guides,setGuides]=React.useState([]);
const [floating,setFloating]=React.useState({visible:false,x:0,y:0,mode:'select'});
const [,forceTick]=React.useReducer(x=>x+1,0);

function refreshLayers(){
const c=fabricRef.current;if(!c)return;
const objs=c.getObjects().filter(o=>!o._isGuide);
onLayersChange(objs.slice().reverse().map(o=>({id:o._studioId,name:o._studioName,type:o._studioType,visible:o.visible!==false,locked:!!o._locked})));
}
function objToSel(o){
if(!o)return null;
return {id:o._studioId,name:o._studioName,type:o._studioType,nativeType:o.type,x:Math.round(o.left||0),y:Math.round(o.top||0),w:Math.round((o.width||0)*(o.scaleX||1)),h:Math.round((o.height||0)*(o.scaleY||1)),angle:Math.round(o.angle||0),opacity:Math.round((o.opacity??1)*100),flipX:!!o.flipX,flipY:!!o.flipY,fill:o._baseColor||(typeof o.fill==='string'?o.fill:'#4f5bd5'),material:o._material||'Flat',blend:o.globalCompositeOperation||'normal',text:(o.type==='i-text'||o.type==='textbox')?o.text:undefined,fontFamily:o.fontFamily,fontSize:o.fontSize,fontWeight:o.fontWeight,textAlign:o.textAlign,locked:!!o._locked};
}
function updateFloatingPos(o){
if(!o||!canvasElRef.current||!containerRef.current){setFloating(f=>({...f,visible:false}));return;}
const r=o.getBoundingRect(true,true);
const canvasRect=canvasElRef.current.getBoundingClientRect();
const contRect=containerRef.current.getBoundingClientRect();
const scale=canvasRect.width/docSize.w;
const x=canvasRect.left-contRect.left+(r.left+r.width/2)*scale;
const y=canvasRect.top-contRect.top+r.top*scale-14;
setFloating({visible:true,x,y,mode:cropGuideRef.current?'crop':'select'});
}

React.useEffect(()=>{
const el=canvasElRef.current;
const c=new fabric.Canvas(el,{width:docSize.w,height:docSize.h,backgroundColor:docBg,preserveObjectStacking:true,selection:true});
fabricRef.current=c;
onReady(c);
c.on('selection:created',()=>{const o=c.getActiveObject();onSelectionChange(objToSel(o));updateFloatingPos(o);});
c.on('selection:updated',()=>{const o=c.getActiveObject();onSelectionChange(objToSel(o));updateFloatingPos(o);});
c.on('selection:cleared',()=>{onSelectionChange(null);setFloating(f=>({...f,visible:false}));});
c.on('object:added',()=>{refreshLayers();onDirty();});
c.on('object:removed',()=>{refreshLayers();onDirty();});
c.on('object:modified',()=>{refreshLayers();const o=c.getActiveObject();if(o){onSelectionChange(objToSel(o));updateFloatingPos(o);}onDirty();});
c.on('mouse:down',(opt)=>{if(opt.target){moveStartRef.current={left:opt.target.left,top:opt.target.top};}});
c.on('object:moving',(opt)=>{
const t=opt.target;const e=opt.e;
if(e&&e.shiftKey&&moveStartRef.current){
const dx=Math.abs(t.left-moveStartRef.current.left),dy=Math.abs(t.top-moveStartRef.current.top);
if(dx>dy)t.top=moveStartRef.current.top;else t.left=moveStartRef.current.left;
}
const gl=[];
if(snapCenter){
const cx=c.width/2,cy=c.height/2;const ctr=t.getCenterPoint();const th=6;
if(Math.abs(ctr.x-cx)<th){t.left+=(cx-ctr.x);gl.push({orient:'v',pos:cx});}
if(Math.abs(ctr.y-cy)<th){t.top+=(cy-ctr.y);gl.push({orient:'h',pos:cy});}
}
if(snapObjects){
const th=6;const tb=t.getBoundingRect(true,true);
c.getObjects().forEach(o=>{
if(o===t||o._isGuide)return;
const b=o.getBoundingRect(true,true);
if(Math.abs(tb.left-b.left)<th){t.left+=(b.left-tb.left);gl.push({orient:'v',pos:b.left});}
if(Math.abs((tb.left+tb.width)-(b.left+b.width))<th){t.left+=((b.left+b.width)-(tb.left+tb.width));gl.push({orient:'v',pos:b.left+b.width});}
if(Math.abs(tb.top-b.top)<th){t.top+=(b.top-tb.top);gl.push({orient:'h',pos:b.top});}
});
}
setGuides(gl);
updateFloatingPos(t);
onSelectionChange(objToSel(t));
});
c.on('object:scaling',(opt)=>updateFloatingPos(opt.target));
c.on('object:rotating',(opt)=>updateFloatingPos(opt.target));
c.on('mouse:up',()=>{setGuides([]);moveStartRef.current=null;});
return ()=>{c.dispose();};
// eslint-disable-next-line
},[]);

React.useEffect(()=>{const c=fabricRef.current;if(!c)return;c.setWidth(docSize.w);c.setHeight(docSize.h);c.requestRenderAll();forceTick();},[docSize.w,docSize.h]);
React.useEffect(()=>{const c=fabricRef.current;if(!c)return;c.setBackgroundColor(docBg,()=>c.requestRenderAll());},[docBg]);

React.useEffect(()=>{
const c=fabricRef.current;if(!c)return;
if(tool==='addImage'){fileInputRef.current&&fileInputRef.current.click();setTool('select');return;}
if(tool==='rect'){StudioEngine.addRect(c);setTool('select');return;}
if(tool==='circle'){StudioEngine.addCircle(c);setTool('select');return;}
if(tool==='line'){StudioEngine.addLine(c);setTool('select');return;}
if(tool==='addText'){StudioEngine.addText(c);setTool('select');return;}
if(tool==='crop'){
const target=c.getActiveObject();
if(!target){onNotice('Select an object to crop first');setTool('select');return;}
cropTargetRef.current=target;
const r=target.getBoundingRect(true,true);
const guide=new fabric.Rect({left:r.left,top:r.top,width:r.width,height:r.height,fill:'rgba(79,91,213,.08)',stroke:'#4f5bd5',strokeDashArray:[6,4],cornerColor:'#4f5bd5',transparentCorners:false});
guide._isGuide=true;
cropGuideRef.current=guide;
c.add(guide);c.setActiveObject(guide);c.requestRenderAll();
updateFloatingPos(guide);
return;
}
if(tool==='pan'){c.discardActiveObject();c.requestRenderAll();}
c.selection=tool==='select';
c.forEachObject(o=>{if(!o._locked)o.selectable=(tool==='select');});
c.defaultCursor=tool==='pan'?'grab':'default';
c.hoverCursor=tool==='pan'?'grab':'move';
// eslint-disable-next-line
},[tool]);

function applyCrop(){
const c=fabricRef.current;const guide=cropGuideRef.current;const target=cropTargetRef.current;
if(!c||!guide||!target)return;
target.clipPath=new fabric.Rect({left:guide.left,top:guide.top,width:guide.width*guide.scaleX,height:guide.height*guide.scaleY,angle:guide.angle,absolutePositioned:true});
c.remove(guide);cropGuideRef.current=null;cropTargetRef.current=null;
c.setActiveObject(target);c.requestRenderAll();
c.fire('object:modified',{target});
setTool('select');
}
function cancelCrop(){
const c=fabricRef.current;const guide=cropGuideRef.current;const target=cropTargetRef.current;
if(guide)c.remove(guide);
cropGuideRef.current=null;cropTargetRef.current=null;
if(target)c.setActiveObject(target);
c.requestRenderAll();
setTool('select');
}

function handleFile(e){
const file=e.target.files&&e.target.files[0];if(!file)return;
const reader=new FileReader();
reader.onload=()=>{StudioEngine.addImageFromDataURL(fabricRef.current,reader.result);};
reader.readAsDataURL(file);
e.target.value='';
}

function doZoom(next){setZoomPctState(Math.max(20,Math.min(300,Math.round(next))));}
function onWheel(e){e.preventDefault();doZoom(zoomPct*(e.deltaY<0?1.08:0.92));}
function fitZoom(){
const cont=containerRef.current;if(!cont)return;
const pad=80;const availW=cont.clientWidth-pad,availH=cont.clientHeight-pad;
const z=Math.min(availW/docSize.w,availH/docSize.h)*100;
setZoomPctState(Math.max(20,Math.min(300,Math.round(z))));
setPanOffset({x:0,y:0});
}

function onContainerMouseDown(e){
const panActive=tool==='pan'||spaceDownRef.current;
if(!panActive)return;
e.preventDefault();
panDragRef.current={startX:e.clientX,startY:e.clientY,startOffset:panOffset};
}
function onContainerMouseMove(e){
if(!panDragRef.current)return;
const {startX,startY,startOffset}=panDragRef.current;
setPanOffset({x:startOffset.x+(e.clientX-startX),y:startOffset.y+(e.clientY-startY)});
}
function onContainerMouseUp(){panDragRef.current=null;}

React.useEffect(()=>{
function down(e){
if(e.code==='Space'&&!spaceDownRef.current){
const tag=(document.activeElement&&document.activeElement.tagName)||'';
if(tag==='INPUT'||tag==='TEXTAREA')return;
spaceDownRef.current=true;e.preventDefault();forceTick();
}
if((e.key==='Delete'||e.key==='Backspace')){
const tag=(document.activeElement&&document.activeElement.tagName)||'';
if(tag==='INPUT'||tag==='TEXTAREA')return;
const c=fabricRef.current;const o=c&&c.getActiveObject();
if(o&&!o.isEditing&&!o._locked){c.remove(o);c.discardActiveObject();c.requestRenderAll();}
}
}
function up(e){if(e.code==='Space'){spaceDownRef.current=false;forceTick();}}
window.addEventListener('keydown',down);window.addEventListener('keyup',up);
return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};
},[]);

const panActive=tool==='pan';
const cursor=panActive||spaceDownRef.current?'grab':'default';

const guideEls=guides.map((g,i)=>{
if(!canvasElRef.current||!containerRef.current)return null;
const canvasRect=canvasElRef.current.getBoundingClientRect();
const contRect=containerRef.current.getBoundingClientRect();
const scale=canvasRect.width/docSize.w;
if(g.orient==='v'){
const left=canvasRect.left-contRect.left+g.pos*scale;
return React.createElement('div',{key:i,style:{position:'absolute',top:0,bottom:0,left,width:1,background:'#4f5bd5',pointerEvents:'none',zIndex:5}});
}
const top=canvasRect.top-contRect.top+g.pos*scale;
return React.createElement('div',{key:i,style:{position:'absolute',left:0,right:0,top,height:1,background:'#4f5bd5',pointerEvents:'none',zIndex:5}});
});

return React.createElement('div',{ref:containerRef,onWheel,onMouseDown:onContainerMouseDown,onMouseMove:onContainerMouseMove,onMouseUp:onContainerMouseUp,onMouseLeave:onContainerMouseUp,style:{flex:1,position:'relative',overflow:'hidden',background:'var(--surface-app,#f5f6f8)',display:'flex',alignItems:'center',justifyContent:'center',cursor}},
React.createElement('input',{ref:fileInputRef,type:'file',accept:'image/*',style:{display:'none'},onChange:handleFile}),
React.createElement('div',{style:{position:'relative',transform:`translate(${panOffset.x}px,${panOffset.y}px) scale(${zoomPct/100})`,boxShadow:'0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)'}},
React.createElement('div',{style:{position:'absolute',inset:0,backgroundImage:'linear-gradient(to right,rgba(0,0,0,.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,.06) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none',opacity:grid?1:0}}),
React.createElement('canvas',{ref:canvasElRef})
),
guideEls,
floating.visible&&React.createElement('div',{style:{position:'absolute',left:floating.x,top:floating.y,transform:'translate(-50%,-100%)',display:'flex',gap:4,background:'var(--surface-panel,#fff)',border:'1px solid var(--border-default,#e5e7eb)',borderRadius:'var(--radius-md,10px)',boxShadow:'var(--shadow-md)',padding:4,zIndex:20}},
floating.mode==='crop'?[
React.createElement('button',{key:'a',onClick:applyCrop,style:toolbarBtnStyle(true)},'Apply crop'),
React.createElement('button',{key:'c',onClick:cancelCrop,style:toolbarBtnStyle(false)},'Cancel'),
]:[
React.createElement('button',{key:'d',title:'Duplicate',onClick:()=>{const c=fabricRef.current;const o=c.getActiveObject();if(!o)return;o.clone(cl=>{cl.set({left:o.left+24,top:o.top+24});cl._studioId=StudioEngine.nextId();cl._studioName=o._studioName+' copy';cl._studioType=o._studioType;cl._material=o._material;cl._baseColor=o._baseColor;cl._locked=false;c.add(cl);c.setActiveObject(cl);c.requestRenderAll();});},style:toolbarBtnStyle(false)},'⧉'),
React.createElement('button',{key:'f',title:'Bring Forward',onClick:()=>{const c=fabricRef.current;const o=c.getActiveObject();if(!o)return;c.bringForward(o);c.fire('object:modified',{target:o});},style:toolbarBtnStyle(false)},'▲'),
React.createElement('button',{key:'b',title:'Send Backward',onClick:()=>{const c=fabricRef.current;const o=c.getActiveObject();if(!o)return;c.sendBackwards(o);c.fire('object:modified',{target:o});},style:toolbarBtnStyle(false)},'▼'),
React.createElement('button',{key:'x',title:'Delete',onClick:()=>{const c=fabricRef.current;const o=c.getActiveObject();if(!o)return;c.remove(o);c.discardActiveObject();c.requestRenderAll();},style:toolbarBtnStyle(false)},'✕'),
]),
React.createElement('div',{style:{position:'absolute',right:16,bottom:16,display:'flex',alignItems:'center',gap:2,background:'var(--surface-panel,#fff)',border:'1px solid var(--border-default,#e5e7eb)',borderRadius:'var(--radius-pill,999px)',padding:4,boxShadow:'var(--shadow-sm)'}},
React.createElement('button',{onClick:()=>doZoom(zoomPct-10),style:zoomBtnStyle},'−'),
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-secondary)',width:44,textAlign:'center'}},zoomPct+'%'),
React.createElement('button',{onClick:()=>doZoom(zoomPct+10),style:zoomBtnStyle},'+'),
React.createElement('button',{onClick:fitZoom,style:{...zoomBtnStyle,width:'auto',padding:'0 10px',fontSize:12}},'Fit')
)
);
}

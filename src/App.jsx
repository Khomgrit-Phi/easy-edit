import React from 'react';
import * as StudioEngine from './engine.js';
import CanvasArea from './CanvasArea.jsx';
import TopBar from './TopBar.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import RightPanel from './RightPanel.jsx';
import LayerPanel from './LayerPanel.jsx';

export default function App(){
const {Dialog,Toast,Button}=window.EasyEditDesignSystem_1140d6;
const [canvas,setCanvas]=React.useState(null);
const [tool,setTool]=React.useState('select');
const [selection,setSelection]=React.useState(null);
const [layers,setLayers]=React.useState([]);
const [dirty,setDirty]=React.useState(false);
const [docSizeState,setDocSizeState]=React.useState({w:1200,h:1200});
const [docBg,setDocBg]=React.useState('#ffffff');
const [snapCenter,setSnapCenter]=React.useState(true);
const [snapObjects,setSnapObjects]=React.useState(true);
const [grid,setGrid]=React.useState(false);
const [projectName,setProjectName]=React.useState('Untitled Project');
const [templateName,setTemplateName]=React.useState(null);
const [toast,setToast]=React.useState(null);
const [previewMode,setPreviewMode]=React.useState(false);
const [confirmTemplate,setConfirmTemplate]=React.useState(null);
const historyRef=React.useRef([]);
const historyIdxRef=React.useRef(-1);
const restoringRef=React.useRef(false);

function setDocSize(patch){setDocSizeState(s=>({...s,...patch}));}
function notice(msg){setToast({msg});window.clearTimeout(window.__studioToastT);window.__studioToastT=window.setTimeout(()=>setToast(null),2600);}
function touch(obj){if(!obj||!canvas)return;obj.setCoords();canvas.requestRenderAll();canvas.fire('object:modified',{target:obj});}

function pushHistory(){
if(!canvas||restoringRef.current)return;
const json=canvas.toJSON(['_studioId','_studioName','_studioType','_locked','_material','_baseColor']);
const stack=historyRef.current.slice(0,historyIdxRef.current+1);
stack.push(json);
if(stack.length>50)stack.shift();
historyRef.current=stack;
historyIdxRef.current=stack.length-1;
}

React.useEffect(()=>{
function isTyping(){
const tag=(document.activeElement&&document.activeElement.tagName)||'';
if(tag==='INPUT'||tag==='TEXTAREA')return true;
const o=canvas&&canvas.getActiveObject();
return !!(o&&o.isEditing);
}
function onKey(e){
const mod=e.metaKey||e.ctrlKey;
if(mod&&(e.key==='z'||e.key==='Z')){e.preventDefault();if(e.shiftKey)doRedo();else doUndo();return;}
if(mod&&(e.key==='y'||e.key==='Y')){e.preventDefault();doRedo();return;}
if(mod&&(e.key==='s'||e.key==='S')){e.preventDefault();handleSave();return;}
if(isTyping())return;
if(mod&&(e.key==='d'||e.key==='D')){
e.preventDefault();
const o=canvas&&canvas.getActiveObject();if(!o)return;
o.clone(cl=>{cl.set({left:o.left+24,top:o.top+24});cl._studioId=StudioEngine.nextId();cl._studioName=o._studioName+' copy';cl._studioType=o._studioType;cl._material=o._material;cl._baseColor=o._baseColor;cl._locked=false;canvas.add(cl);canvas.setActiveObject(cl);canvas.requestRenderAll();});
return;
}
if(e.key==='Escape'){canvas&&canvas.discardActiveObject();canvas&&canvas.requestRenderAll();return;}
if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
const o=canvas&&canvas.getActiveObject();if(!o||o._locked)return;
e.preventDefault();
const step=e.shiftKey?10:1;
if(e.key==='ArrowUp')o.top-=step;
if(e.key==='ArrowDown')o.top+=step;
if(e.key==='ArrowLeft')o.left-=step;
if(e.key==='ArrowRight')o.left+=step;
touch(o);
return;
}
const shortcuts={v:'select',h:'pan',i:'addImage',t:'addText',r:'rect',o:'circle',l:'line',c:'crop'};
const key=e.key.toLowerCase();
if(shortcuts[key]&&!previewMode){setTool(shortcuts[key]);}
}
window.addEventListener('keydown',onKey);
return ()=>window.removeEventListener('keydown',onKey);
// eslint-disable-next-line
},[canvas,previewMode]);

React.useEffect(()=>{
if(!canvas)return;
const handler=()=>pushHistory();
canvas.on('object:added',handler);
canvas.on('object:removed',handler);
canvas.on('object:modified',handler);
pushHistory();
return ()=>{canvas.off('object:added',handler);canvas.off('object:removed',handler);canvas.off('object:modified',handler);};
// eslint-disable-next-line
},[canvas]);

function refreshFromCanvas(){
if(!canvas)return;
const objs=canvas.getObjects().filter(o=>!o._isGuide);
setLayers(objs.slice().reverse().map(o=>({id:o._studioId,name:o._studioName,type:o._studioType,visible:o.visible!==false,locked:!!o._locked})));
setSelection(null);
}

function doUndo(){
if(!canvas)return;const idx=historyIdxRef.current;if(idx<=0)return;
restoringRef.current=true;historyIdxRef.current=idx-1;
canvas.loadFromJSON(historyRef.current[idx-1],()=>{canvas.requestRenderAll();restoringRef.current=false;refreshFromCanvas();});
}
function doRedo(){
if(!canvas)return;const idx=historyIdxRef.current;if(idx>=historyRef.current.length-1)return;
restoringRef.current=true;historyIdxRef.current=idx+1;
canvas.loadFromJSON(historyRef.current[idx+1],()=>{canvas.requestRenderAll();restoringRef.current=false;refreshFromCanvas();});
}

function handleAddAsset(category,item){
if(!canvas)return;
if(category==='Images')StudioEngine.addPlaceholderImage(canvas,item.color,item.name);
else StudioEngine.addAssetShape(canvas,item);
setDirty(true);
}

function applyTemplate(t){
if(!canvas)return;
if(t.id==='blank'){canvas.clear();canvas.backgroundColor=docBg;canvas.requestRenderAll();}
else if(t.id==='sample'){StudioEngine.loadSampleComposition(canvas);}
setTemplateName(t.id==='blank'?null:t.name);
setDirty(false);
notice(`${t.name} loaded`);
}
function requestTemplate(t){if(dirty){setConfirmTemplate(t);}else{applyTemplate(t);}}

function handleSave(){setDirty(false);notice('Configuration saved');}
function handleExport(fmt){
if(!canvas)return;
const base=projectName.replace(/\s+/g,'-').toLowerCase()||'2d-studio-export';
if(fmt==='PDF')StudioEngine.exportPDF(canvas,base);
if(fmt==='PNG')StudioEngine.exportPNG(canvas,base);
if(fmt==='JPG')StudioEngine.exportJPG(canvas,base);
notice(`Exported ${fmt}`);
}

return (
<div style={{height:'100vh',minWidth:1180,width:'100%',display:'flex',flexDirection:'column',fontFamily:'var(--font-body)',background:'var(--surface-app,#f5f6f8)',overflowX:'auto',overflowY:'hidden'}}>
{!previewMode&&<TopBar projectName={projectName} setProjectName={setProjectName} onUndo={doUndo} onRedo={doRedo} onSave={handleSave} onPreview={()=>setPreviewMode(true)} onExport={handleExport} dirty={dirty} templateName={templateName}/>}
<div style={{flex:1,display:'flex',minHeight:0}}>
{!previewMode&&<LeftSidebar tool={tool} setTool={setTool} onAddAsset={handleAddAsset} onSelectTemplate={requestTemplate}/>}
<div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
<CanvasArea onReady={setCanvas} onSelectionChange={setSelection} onLayersChange={setLayers} onDirty={()=>setDirty(true)} onNotice={notice} docSize={docSizeState} docBg={docBg} tool={previewMode?'select':tool} setTool={setTool} grid={grid} snapCenter={snapCenter} snapObjects={snapObjects}/>
</div>
{!previewMode&&canvas&&
<div style={{width:308,flexShrink:0,borderLeft:'1px solid var(--border-default)',background:'var(--surface-app,#f5f6f8)',display:'flex',flexDirection:'column',minHeight:0}}>
<RightPanel canvas={canvas} selection={selection} docSize={docSizeState} setDocSize={setDocSize} docBg={docBg} setDocBg={setDocBg} snapCenter={snapCenter} setSnapCenter={setSnapCenter} snapObjects={snapObjects} setSnapObjects={setSnapObjects} grid={grid} setGrid={setGrid} touch={touch}/>
<LayerPanel canvas={canvas} layers={layers} selectedId={selection&&selection.id} touch={touch}/>
</div>}
</div>
{previewMode&&<button onClick={()=>setPreviewMode(false)} style={{position:'fixed',top:16,right:16,zIndex:50,padding:'8px 16px',borderRadius:'var(--radius-pill)',border:'1px solid var(--border-default)',background:'#fff',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:13,fontWeight:600}}>Exit preview</button>}
{toast&&<div style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',zIndex:60}}><Toast tone="success">{toast.msg}</Toast></div>}
{confirmTemplate&&<Dialog title="Unsaved changes" onClose={()=>setConfirmTemplate(null)} actions={<React.Fragment><Button variant="ghost" onClick={()=>setConfirmTemplate(null)}>Cancel</Button><Button variant="primary" onClick={()=>{applyTemplate(confirmTemplate);setConfirmTemplate(null);}}>Load template</Button></React.Fragment>}>
Loading "{confirmTemplate.name}" will replace the current canvas. Unsaved changes will be lost.
</Dialog>}
</div>);
}

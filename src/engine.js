import { fabric } from 'fabric';
import { jsPDF } from 'jspdf';

let idSeq=0;
const counters={};
export function nextId(){return 'obj-'+(++idSeq);}
export function nextName(label){counters[label]=(counters[label]||0)+1;return `${label} ${counters[label]}`;}
export function makeFill(material,color){
if(!material||material==='Flat'||material==='Custom')return color;
const size=16;const c=document.createElement('canvas');c.width=size;c.height=size;
const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,size,size);
if(material==='Cotton'){ctx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<14;i++){ctx.fillRect(Math.random()*size,Math.random()*size,1,1);}}
else if(material==='Polyester'){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;for(let i=-size;i<size*2;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+size,size);ctx.stroke();}}
else if(material==='Mesh'){ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.35)';ctx.strokeRect(.5,.5,size-1,size-1);ctx.beginPath();ctx.moveTo(size/2,0);ctx.lineTo(size/2,size);ctx.moveTo(0,size/2);ctx.lineTo(size,size/2);ctx.stroke();}
return new fabric.Pattern({source:c,repeat:'repeat'});
}
export function getBlendColorFilter(){return (fabric.filters&&fabric.filters.BlendColor)||(fabric.Image&&fabric.Image.filters&&fabric.Image.filters.BlendColor)||null;}
export function tagObject(obj,type,label){obj._studioId=nextId();obj._studioName=nextName(label);obj._studioType=type;obj._locked=false;obj._material='Flat';obj._baseColor=(obj.fill&&typeof obj.fill==='string')?obj.fill:(obj.stroke||'#4f5bd5');return obj;}
export function addRect(canvas){const o=new fabric.Rect({left:canvas.width/2-90,top:canvas.height/2-70,width:180,height:140,fill:'#4f5bd5',rx:4,ry:4});tagObject(o,'shape','Rectangle');canvas.add(o);canvas.setActiveObject(o);canvas.requestRenderAll();return o;}
export function addCircle(canvas){const o=new fabric.Circle({left:canvas.width/2-60,top:canvas.height/2-60,radius:60,fill:'#e0663f'});tagObject(o,'shape','Circle');canvas.add(o);canvas.setActiveObject(o);canvas.requestRenderAll();return o;}
export function addLine(canvas){const cx=canvas.width/2,cy=canvas.height/2;const o=new fabric.Line([cx-90,cy,cx+90,cy],{stroke:'#17191c',strokeWidth:4});tagObject(o,'shape','Line');canvas.add(o);canvas.setActiveObject(o);canvas.requestRenderAll();return o;}
export function addText(canvas){const o=new fabric.IText('Double-click to edit',{left:canvas.width/2-140,top:canvas.height/2-24,fontSize:32,fontFamily:'Inter, sans-serif',fill:'#17191c',fontWeight:'600'});tagObject(o,'text','Text');canvas.add(o);canvas.setActiveObject(o);canvas.requestRenderAll();return o;}
export function addPlaceholderImage(canvas,color,label){const o=new fabric.Rect({left:canvas.width/2-150,top:canvas.height/2-100,width:300,height:200,fill:color,rx:2,ry:2});tagObject(o,'image',label||'Image');canvas.add(o);canvas.setActiveObject(o);canvas.requestRenderAll();return o;}
export function addAssetShape(canvas,item){
let o;const cx=canvas.width/2+(Math.random()*40-20),cy=canvas.height/2+(Math.random()*40-20);
switch(item.shape){
case 'circle':o=new fabric.Circle({left:cx-30,top:cy-30,radius:30,fill:item.color});break;
case 'triangle':o=new fabric.Triangle({left:cx-30,top:cy-30,width:60,height:60,fill:item.color});break;
case 'diamond':o=new fabric.Rect({left:cx-26,top:cy-26,width:52,height:52,fill:item.color,angle:45});break;
case 'dot':o=new fabric.Circle({left:cx-8,top:cy-8,radius:8,fill:item.color});break;
case 'stripe':o=new fabric.Rect({left:cx-60,top:cy-6,width:120,height:12,fill:item.color});break;
case 'ring':o=new fabric.Circle({left:cx-30,top:cy-30,radius:30,fill:'transparent',stroke:item.color,strokeWidth:4});break;
case 'line':o=new fabric.Line([cx-50,cy,cx+50,cy],{stroke:item.color,strokeWidth:3});break;
default:o=new fabric.Rect({left:cx-40,top:cy-30,width:80,height:60,fill:item.color});
}
tagObject(o,'shape',item.name);
canvas.add(o);canvas.setActiveObject(o);canvas.requestRenderAll();return o;
}
export function addImageFromDataURL(canvas,dataUrl,cb){
fabric.Image.fromURL(dataUrl,(img)=>{
const maxSide=520;const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
img.set({left:canvas.width/2-(img.width*scale)/2,top:canvas.height/2-(img.height*scale)/2,scaleX:scale,scaleY:scale});
tagObject(img,'image','Image');
canvas.add(img);canvas.setActiveObject(img);canvas.requestRenderAll();
if(cb)cb(img);
});
}
export function loadSampleComposition(canvas){
canvas.clear();canvas.backgroundColor='#ffffff';
const w=canvas.width,h=canvas.height;
const bg=new fabric.Rect({left:0,top:0,width:w,height:h,fill:'#eef0f3'});tagObject(bg,'shape','Background');
const base=new fabric.Rect({left:w*0.22,top:h*0.2,width:w*0.56,height:h*0.56,fill:'#1d2a4d',rx:6,ry:6});tagObject(base,'shape','Base Image');
const pattern=new fabric.Circle({left:w*0.34,top:h*0.3,radius:w*0.14,fill:makeFill('Mesh','#8891a8')});tagObject(pattern,'shape','Pattern');pattern._material='Mesh';pattern._baseColor='#8891a8';
const accent=new fabric.Circle({left:w*0.63,top:h*0.62,radius:26,fill:'#e0663f'});tagObject(accent,'shape','Accent');
const label=new fabric.IText('SAMPLE',{left:w*0.3,top:h*0.68,fontSize:34,fontWeight:'700',fill:'#ffffff',fontFamily:'Inter, sans-serif'});tagObject(label,'text','Label');
const deco=new fabric.Rect({left:w*0.24,top:h*0.24,width:w*0.1,height:10,fill:'#ffffff'});tagObject(deco,'shape','Decoration');
[bg,base,pattern,accent,label,deco].forEach(o=>canvas.add(o));
canvas.discardActiveObject();canvas.requestRenderAll();
}
export function triggerDownload(url,filename){const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();}
export function exportPNG(canvas,name){const url=canvas.toDataURL({format:'png',quality:1,multiplier:2});triggerDownload(url,`${name}.png`);}
export function exportJPG(canvas,name){const url=canvas.toDataURL({format:'jpeg',quality:0.92,multiplier:2});triggerDownload(url,`${name}.jpg`);}
export function exportPDF(canvas,name){
const url=canvas.toDataURL({format:'png',quality:1,multiplier:2});
const doc=new jsPDF({unit:'px',format:[canvas.width,canvas.height]});
doc.addImage(url,'PNG',0,0,canvas.width,canvas.height);
doc.save(`${name}.pdf`);
}

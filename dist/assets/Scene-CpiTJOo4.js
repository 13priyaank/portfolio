import{r as e}from"./rolldown-runtime-hePW80VL.js";import{a as t,c as n,d as r,i,l as a,n as o,o as s,p as c,r as l,s as u,t as d,u as f}from"./three-NCLUCvfR.js";import{i as p,n as m,r as h,t as g}from"./index-s3WZuUd8.js";var _=e(c(),1),v=r(),y=new s(`#e8b04a`),b=new s(`#cfcbc2`),x=`
  uniform float uTime;
  uniform float uSpread;
  uniform float uSize;
  uniform float uPx;
  uniform vec3 uMouse;
  uniform float uPulseT;
  uniform vec3 uPulseO;
  attribute vec3 aRand;
  attribute float aSeed;
  varying float vFade;
  varying float vHot;
  varying float vPush;
  void main() {
    vec3 n = normalize(position);
    vec3 p = position;
    // slow organic breathing
    float w = sin(p.x * 2.1 + uTime * 0.5) + sin(p.y * 2.7 - uTime * 0.4) + sin(p.z * 2.3 + uTime * 0.3);
    p += n * w * 0.03;
    // cursor pushes nearby points outward
    float d = distance(p, uMouse);
    float push = smoothstep(0.7, 0.0, d);
    p += n * push * 0.2;
    // click shockwave: a ring travels over the sphere from where you clicked
    float pd = distance(n, normalize(uPulseO));
    float wave = exp(-pow((pd - uPulseT * 2.4) * 3.2, 2.0)) * exp(-uPulseT * 1.2);
    p += n * wave * 0.38;
    push = max(push, wave);
    // scatter (used by the intro "assemble")
    float s = uSpread * uSpread;
    p += aRand * 3.2 * s;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aSeed * 0.9) * (1.0 + push * 1.1) * uPx * (5.0 / -mv.z);
    vFade = clamp(1.0 - (-mv.z - 3.6) / 3.0, 0.15, 1.0);
    vHot = step(0.965, aSeed);
    vPush = push;
  }
`,S=`
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform float uDim;
  uniform float uEnergy;
  varying float vFade;
  varying float vHot;
  varying float vPush;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.08, r);
    vec3 col = mix(uBase, uAccent, clamp(vHot + vPush * 0.9 + uEnergy * 0.3, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vFade * uDim * 0.9);
  }
`;function C(e){let t=new Float32Array(e*3),n=new Float32Array(e*3),r=new Float32Array(e),i=Math.PI*(3-Math.sqrt(5));for(let a=0;a<e;a++){let o=1-a/(e-1)*2,s=Math.sqrt(1-o*o),c=i*a;t.set([Math.cos(c)*s,o,Math.sin(c)*s],a*3),n.set([Math.random()*2-1,Math.random()*2-1,Math.random()*2-1],a*3),r[a]=Math.random()}return{pos:t,rand:n,seed:r}}function w({reduced:e=!1}){let r=(0,_.useRef)(null),s=(0,_.useRef)(null),c=(0,_.useRef)(null),d=(0,_.useRef)(null),p=(0,_.useRef)(null),g=(0,_.useRef)(null),{viewport:w,gl:T}=l(),E=m(),D=E?1800:3600,{geometry:O,uniforms:k}=(0,_.useMemo)(()=>{let{pos:e,rand:n,seed:r}=C(D),o=new t;return o.setAttribute(`position`,new i(e,3)),o.setAttribute(`aRand`,new i(n,3)),o.setAttribute(`aSeed`,new i(r,1)),{geometry:o,uniforms:{uTime:{value:0},uSpread:{value:1},uSize:{value:E?2.8:2.4},uPx:{value:1},uMouse:{value:new a(9,9,9)},uPulseT:{value:99},uPulseO:{value:new a(0,0,1)},uEnergy:{value:0},uBase:{value:b},uAccent:{value:y},uDim:{value:1}}}},[D,E]),A=(0,_.useMemo)(()=>new f(new u(.985,2)),[]),j=(0,_.useMemo)(()=>new a,[]),M=(0,_.useRef)({t:0,n:0,done:!1}),N=(0,_.useRef)(!1);return o((t,i)=>{let a=Math.min(i,.05),{pose:o,mouse:l}=h,u=E?.28:1,f=M.current;f.done||(f.t+=i,f.n++,f.n===90&&(f.t/f.n>.026&&t.setDpr(1),f.done=!0));let m=o.x*(w.width/2)*u,_=o.y*(w.height/2)+(E?w.height*.12:0),v=E?.8:1;e||!N.current?(N.current=!0,r.current.position.set(m,_,0),r.current.scale.setScalar(o.s*v)):(r.current.position.x=n.damp(r.current.position.x,m,5,a),r.current.position.y=n.damp(r.current.position.y,_,5,a),r.current.scale.setScalar(n.damp(r.current.scale.x,o.s*v,5,a))),e||(s.current.rotation.x=n.damp(s.current.rotation.x,-l.y*.35,3,a),s.current.rotation.y=n.damp(s.current.rotation.y,l.x*.45,3,a),c.current.rotation.y+=a*(o.spin+h.energy*.7),d.current.rotation.z+=a*.05),j.set(l.x*w.width*.5,l.y*w.height*.5,1.1),c.current.worldToLocal(j),e||g.current.uniforms.uMouse.value.copy(j);let y=g.current.uniforms;y.uTime.value+=a,h.pulse.fresh?(h.pulse.fresh=!1,y.uPulseO.value.copy(j),y.uPulseT.value=0):y.uPulseT.value<50&&(y.uPulseT.value+=a),y.uEnergy.value=h.energy,y.uSpread.value=o.spread,y.uDim.value=o.dim*(E?.5:1),y.uPx.value=T.getPixelRatio(),p.current.material.opacity=o.wire*.16*Math.min(1,o.dim*1.6)*(E?.6:1)*(1-o.spread),d.current.material.opacity=(1-o.spread)*Math.min(.5,o.dim*.6)}),(0,v.jsx)(`group`,{ref:r,children:(0,v.jsxs)(`group`,{ref:s,children:[(0,v.jsxs)(`group`,{ref:c,children:[(0,v.jsx)(`points`,{geometry:O,frustumCulled:!1,children:(0,v.jsx)(`shaderMaterial`,{ref:g,uniforms:k,vertexShader:x,fragmentShader:S,transparent:!0,depthWrite:!1})}),(0,v.jsx)(`lineSegments`,{ref:p,geometry:A,children:(0,v.jsx)(`lineBasicMaterial`,{color:`#e9e6df`,transparent:!0,opacity:0,depthWrite:!1})})]}),(0,v.jsxs)(`mesh`,{ref:d,rotation:[1.15,.2,0],children:[(0,v.jsx)(`torusGeometry`,{args:[1.55,.0045,6,220]}),(0,v.jsx)(`meshBasicMaterial`,{color:`#e8b04a`,transparent:!0,opacity:0,depthWrite:!1})]})]})})}var T=class extends _.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}componentDidCatch(){this.props.onFail()}render(){return this.state.failed?null:this.props.children}};function E(){let e=l(e=>e.invalidate);return(0,_.useEffect)(()=>(p.add(e),()=>{p.delete(e)}),[e]),null}function D({reduced:e,onReady:t,onFail:n}){let[r]=(0,_.useState)(()=>g());if((0,_.useEffect)(()=>{r||n()},[r,n]),(0,_.useEffect)(()=>{if(e)return;let t=e=>{h.mouse.x=e.clientX/window.innerWidth*2-1,h.mouse.y=-(e.clientY/window.innerHeight*2-1)};return window.addEventListener(`pointermove`,t,{passive:!0}),()=>window.removeEventListener(`pointermove`,t)},[e]),!r)return null;let i=m();return(0,v.jsx)(T,{onFail:n,children:(0,v.jsxs)(d,{className:`scene-canvas`,frameloop:e?`demand`:`always`,dpr:[1,i?1.5:1.75],camera:{position:[0,0,5],fov:40,near:.1,far:20},gl:{antialias:!i,alpha:!0,powerPreference:`high-performance`},onCreated:({gl:e,invalidate:r})=>{e.setClearColor(0,0),e.domElement.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),n()}),r(),t()},children:[(0,v.jsx)(w,{reduced:e}),e&&(0,v.jsx)(E,{})]})})}export{D as default};
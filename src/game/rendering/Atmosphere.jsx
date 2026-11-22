import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';
const vertex = `varying vec3 direction; void main(){ direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const fragment = `varying vec3 direction;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);}
void main(){vec3 d=normalize(direction);float h=max(d.y,0.0);vec3 col=mix(vec3(.56,.48,.44),vec3(.075,.16,.25),smoothstep(0.0,.7,h));float sun=pow(max(dot(d,normalize(vec3(-.6,.18,-1.0))),0.0),420.0);col+=vec3(1.0,.67,.35)*sun;vec2 p=d.xz/(max(d.y,.06))*2.0;float n=noise(p)*.58+noise(p*2.1)*.28+noise(p*4.3)*.14;float cloud=smoothstep(.55,.77,n)*smoothstep(.04,.2,h)*(1.0-smoothstep(.4,.8,h));col=mix(col,vec3(.65,.66,.68),cloud*.55);gl_FragColor=vec4(col,1.0);}`;
export default function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[230, 32, 16]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
export function Water() {
  const material = useRef();
  useFrame(({ clock }) => {
    material.current.uniforms.time.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.05, 0]}>
      <planeGeometry args={[1800, 1800]} />
      <shaderMaterial
        ref={material}
        uniforms={{ time: { value: 0 } }}
        vertexShader={`varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`varying vec2 p;uniform float time;void main(){float wave=sin(p.x*.32+p.y*.18+time*.5)*sin(p.y*.6-time*.35);float ripple=pow(max(0.,wave),12.);float wake=exp(-abs(p.x+70.)*.018);vec3 color=mix(vec3(.045,.12,.17),vec3(.13,.23,.28),wave*.15+.5);color+=vec3(.37,.25,.15)*ripple*wake*.5;gl_FragColor=vec4(color,1.);}`}
      />
    </mesh>
  );
}

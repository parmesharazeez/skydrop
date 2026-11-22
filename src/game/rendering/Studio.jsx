import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  CanvasTexture,
  EquirectangularReflectionMapping,
  PMREMGenerator,
  SRGBColorSpace,
} from 'three';
import Drone from '../drone/Drone.jsx';
export function Reflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#96b5c7');
    gradient.addColorStop(0.5, '#405563');
    gradient.addColorStop(1, '#101923');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    context.fillStyle = '#f0e6d7';
    context.fillRect(60, 30, 80, 80);
    context.fillStyle = '#b9d9ed';
    context.fillRect(330, 50, 30, 115);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.mapping = EquirectangularReflectionMapping;
    const generator = new PMREMGenerator(gl);
    const target = generator.fromEquirectangular(texture);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.6;
    return () => {
      scene.environment = null;
      target.dispose();
      texture.dispose();
      generator.dispose();
    };
  }, [gl, scene]);
  return null;
}
export default function Studio({ game }) {
  return (
    <>
      <color attach="background" args={['#0c1721']} />
      <fog attach="fog" args={['#0c1721', 18, 50]} />
      <hemisphereLight args={['#c1d8e6', '#182631', 1.5]} />
      <directionalLight position={[0, 10, 6]} color="#e6f1f6" intensity={3} />
      <directionalLight position={[-5, 4, -5]} color="#749bb9" intensity={4} />
      <directionalLight position={[8, 3, 2]} color="#e6cdb0" intensity={2} />
      <group position={[3, 1, 0]} scale={2.2}>
        <Drone game={game} preview />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial
          color="#152530"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[3, -2.5, 0]}>
        <cylinderGeometry args={[4.9, 5.1, 0.18, 96]} />
        <meshStandardMaterial
          color="#243640"
          metalness={0.65}
          roughness={0.42}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, -2.39, 0]}>
        <ringGeometry args={[4.65, 4.67, 96]} />
        <meshBasicMaterial color="#738b95" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, -2.38, 0]}>
        <circleGeometry args={[3.6, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={`varying vec2 uvP;void main(){uvP=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec2 uvP;void main(){float a=1.-smoothstep(.05,.5,distance(uvP,vec2(.5)));gl_FragColor=vec4(0.,0.,0.,a*.6);}`}
        />
      </mesh>
    </>
  );
}

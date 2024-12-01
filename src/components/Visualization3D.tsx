import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Visualization3DProps {
  screenDimensions: {
    width: number;
    height: number;
  };
  roomDimensions: {
    width: number;
    depth: number;
    height: number;
    screenHeight: number;
  };
}

export const Visualization3D: React.FC<Visualization3DProps> = ({ screenDimensions, roomDimensions }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(
      roomDimensions.width * 1.5,
      roomDimensions.height * 1.2,
      roomDimensions.depth * 1.5
    );
    camera.lookAt(roomDimensions.width / 2, roomDimensions.height / 2, roomDimensions.depth / 2);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(roomDimensions.width / 2, roomDimensions.height / 2, roomDimensions.depth / 2);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(roomDimensions.width, roomDimensions.height * 1.5, roomDimensions.depth);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 3000;
    directionalLight.shadow.camera.left = -roomDimensions.width;
    directionalLight.shadow.camera.right = roomDimensions.width;
    directionalLight.shadow.camera.top = roomDimensions.height;
    directionalLight.shadow.camera.bottom = -roomDimensions.height;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(roomDimensions.width/2, roomDimensions.height-1, roomDimensions.depth/2);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    scene.add(pointLight);

    // Create room walls
    const wallMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide
    });

    const WALL_THICKNESS = 10;
    const FLOOR_THICKNESS = 5;
    const SCREEN_THICKNESS = 5;

    // Floor
    const floorGeometry = new THREE.BoxGeometry(roomDimensions.width, FLOOR_THICKNESS, roomDimensions.depth);
    const floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({ 
      color: 0x808080,
      shininess: 0
    }));
    floor.position.set(
      roomDimensions.width / 2,
      -FLOOR_THICKNESS / 2,
      roomDimensions.depth / 2
    );
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall (mur de l'écran)
    const backWallGeometry = new THREE.BoxGeometry(roomDimensions.width, roomDimensions.height, WALL_THICKNESS);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(
      roomDimensions.width / 2,
      roomDimensions.height / 2,
      -WALL_THICKNESS / 2
    );
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const sideWallGeometry = new THREE.BoxGeometry(WALL_THICKNESS, roomDimensions.height, roomDimensions.depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(
      -WALL_THICKNESS / 2,
      roomDimensions.height / 2,
      roomDimensions.depth / 2
    );
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Create screen
    const screenGeometry = new THREE.BoxGeometry(screenDimensions.width, screenDimensions.height, SCREEN_THICKNESS);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 30
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    
    // Centrer l'écran sur le mur du fond
    const screenX = roomDimensions.width / 2;  // Centre de la pièce
    screen.position.set(
      screenX,
      roomDimensions.screenHeight + screenDimensions.height / 2,
      SCREEN_THICKNESS / 2 + 2
    );
    screen.castShadow = true;
    screen.receiveShadow = true;
    scene.add(screen);

    // Add furniture
    const tableMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8b4513,
      shininess: 30
    });

    // Table
    const tableGeometry = new THREE.BoxGeometry(120, 5, 60);
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(roomDimensions.width/2, 30, roomDimensions.depth/2);
    table.castShadow = true;
    table.receiveShadow = true;
    scene.add(table);

    // Chairs
    const chairGeometry = new THREE.BoxGeometry(40, 50, 40);
    [-30, 30].forEach(x => {
      const chair = new THREE.Mesh(chairGeometry, tableMaterial);
      chair.position.set(roomDimensions.width/2 + x, 25, roomDimensions.depth/2 + 40);
      chair.castShadow = true;
      chair.receiveShadow = true;
      scene.add(chair);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [roomDimensions, screenDimensions]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Visualisation 3D
      </Typography>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #ccc'
        }}
      />
    </Box>
  );
};

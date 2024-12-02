import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { PMREMGenerator } from 'three';
import { CubeTextureLoader } from 'three';

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

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    
    // Load textures with error handling and logging
    const wallTexture = textureLoader.load(
        '/textures/plastered_wall_diff_4k.jpg',
        (texture) => {
            console.log('Wall texture loaded successfully');
            texture.repeat.set(2, 2);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        },
        undefined,
        (error) => console.error('Error loading wall texture:', error)
    );

    const floorTexture = textureLoader.load(
        '/textures/laminate_floor_02_diff_4k.jpg',
        (texture) => {
            console.log('Floor texture loaded successfully');
            texture.repeat.set(4, 4);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        },
        undefined,
        (error) => console.error('Error loading floor texture:', error)
    );

    // Load screen texture with better handling
    const texturePath = 'textures/teams.jpg';  // Chemin relatif depuis public
    console.log('Attempting to load texture from:', texturePath);
    
    const screenTexture = textureLoader.load(
        texturePath,
        (texture) => {
            console.log('Screen texture loaded successfully');
            console.log('Texture dimensions:', texture.image.width, 'x', texture.image.height);
            
            // Configuration de base de la texture
            texture.flipY = false;
            texture.needsUpdate = true;
            texture.colorSpace = THREE.SRGBColorSpace;
            
            // Amélioration de la qualité
            if (rendererRef.current) {
                const maxAnisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
                texture.anisotropy = maxAnisotropy;
                console.log('Using maximum anisotropy:', maxAnisotropy);
            }
            
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            
            // Ajustement précis de la texture
            texture.center.set(0.5, 0.5);
            texture.repeat.set(1, 1);
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;

            // Forcer la mise à jour du matériau
            screenSurfaceMaterial.needsUpdate = true;
        },
        undefined,
        (error) => {
            console.error('Error loading screen texture:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    path: texturePath
                });
            }
        }
    );

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Configuration du renderer pour une meilleure qualité
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limite pour les écrans haute densité
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Légèrement augmenté pour plus de clarté
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create skybox first
    const path = '/textures/skybox/bluesky/';
    const format = '.bmp';
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    // PMREM Generator for HDR
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Load HDR environment map for lighting and reflections
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/textures/brown_photostudio_02_4k.hdr', function(hdrTexture) {
        hdrTexture.colorSpace = THREE.SRGBColorSpace;
        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
        scene.environment = envMap; // Pour les réflexions et l'éclairage
        pmremGenerator.dispose();
        hdrTexture.dispose();
    });

    // Load skybox for background
    const reflectionCube = new THREE.CubeTextureLoader().load(urls, 
        function(texture) {
            console.log('Skybox loaded successfully');
            scene.background = texture; // Uniquement pour l'arrière-plan
        },
        undefined,
        function(err) {
            console.error('Error loading skybox:', err);
        }
    );
    reflectionCube.colorSpace = THREE.SRGBColorSpace;
    
    // Create skybox sphere
    const skyGeometry = new THREE.SphereGeometry(8000, 64, 32);
    skyGeometry.scale(-1, 1, 1);
    
    const skyMaterial = new THREE.MeshBasicMaterial({
        envMap: reflectionCube,
        side: THREE.BackSide,
        fog: false
    });
    const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skybox);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      12000
    );

    camera.position.set(
      roomDimensions.width * 2,
      roomDimensions.height * 1.5,
      roomDimensions.depth * 2
    );
    camera.lookAt(roomDimensions.width / 2, roomDimensions.height / 2, roomDimensions.depth / 2);
    cameraRef.current = camera;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 6000;
    controls.minDistance = 100;
    controls.target.set(roomDimensions.width / 2, roomDimensions.height / 2, roomDimensions.depth / 2);
    controlsRef.current = controls;

    // Matériaux avec réflexions
    const wallMaterial = new THREE.MeshPhysicalMaterial({
        map: wallTexture,
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.3,      // Plus lisse pour plus de réflexions
        metalness: 0.1,      // Légère métallicité pour les réflexions
        envMapIntensity: 1.0, // Intensité des réflexions
        clearcoat: 0.1,      // Léger effet de vernis
        clearcoatRoughness: 0.3
    });

    const floorMaterial = new THREE.MeshPhysicalMaterial({
        map: floorTexture,
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.2,      // Très lisse pour des réflexions marquées
        metalness: 0.1,
        envMapIntensity: 1.2,
        clearcoat: 0.3,      // Plus de vernis pour le sol
        clearcoatRoughness: 0.2
    });

    // Création de la surface de l'écran avec un matériau amélioré
    const screenSurfaceMaterial = new THREE.MeshStandardMaterial({
        map: screenTexture,
        side: THREE.FrontSide,
        metalness: 0.1,    // Légère brillance métallique
        roughness: 0.2,    // Surface moyennement lisse
        envMapIntensity: 1.2
    });

    console.log('Screen material created:', {
        map: screenSurfaceMaterial.map ? 'texture loaded' : 'no texture',
        side: screenSurfaceMaterial.side,
        visible: screenSurfaceMaterial.visible
    });

    const WALL_THICKNESS = 20; 
    const FLOOR_THICKNESS = 15; 
    const SCREEN_THICKNESS = 5;

    // Floor with texture
    const floorGeometry = new THREE.BoxGeometry(roomDimensions.width, FLOOR_THICKNESS, roomDimensions.depth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(
      roomDimensions.width / 2,
      -FLOOR_THICKNESS / 2,
      roomDimensions.depth / 2
    );
    floor.receiveShadow = true;
    floor.castShadow = true;
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
    backWall.castShadow = true;
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
    leftWall.castShadow = true;
    scene.add(leftWall);

    // Create screen with frame
    const SCREEN_FRAME_THICKNESS = 2;
    const SCREEN_DEPTH = 5;
    const SCREEN_BORDER_RADIUS = 1;

    // Matériaux pour l'écran
    const screenFrameMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,     // Noir profond
        roughness: 0.3,
        metalness: 0.8,      // Aspect métallique pour le cadre
        clearcoat: 0.5,      // Effet brillant
        clearcoatRoughness: 0.3
    });

    // Création du cadre de l'écran
    const screenFrame = new THREE.Shape();
    screenFrame.moveTo(-SCREEN_BORDER_RADIUS, 0);
    screenFrame.lineTo(screenDimensions.width + SCREEN_BORDER_RADIUS, 0);
    screenFrame.lineTo(screenDimensions.width + SCREEN_BORDER_RADIUS, screenDimensions.height);
    screenFrame.lineTo(-SCREEN_BORDER_RADIUS, screenDimensions.height);
    
    const hole = new THREE.Path();
    hole.moveTo(0, SCREEN_FRAME_THICKNESS);
    hole.lineTo(screenDimensions.width, SCREEN_FRAME_THICKNESS);
    hole.lineTo(screenDimensions.width, screenDimensions.height - SCREEN_FRAME_THICKNESS);
    hole.lineTo(0, screenDimensions.height - SCREEN_FRAME_THICKNESS);
    screenFrame.holes.push(hole);

    const frameExtrudeSettings = {
        steps: 1,
        depth: SCREEN_DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.5,
        bevelSegments: 3
    };

    const frameGeometry = new THREE.ExtrudeGeometry(screenFrame, frameExtrudeSettings);
    const frame = new THREE.Mesh(frameGeometry, screenFrameMaterial);
    frame.position.set(
        roomDimensions.width / 2 - screenDimensions.width / 2,
        roomDimensions.height / 2 - screenDimensions.height / 2,
        WALL_THICKNESS / 2
    );
    frame.castShadow = true;
    frame.receiveShadow = true;

    // Dimensions précises pour l'écran
    const screenWidth = screenDimensions.width - SCREEN_FRAME_THICKNESS * 2.2;  
    const screenHeight = screenDimensions.height - SCREEN_FRAME_THICKNESS * 2.2;
    
    // Création de la surface de l'écran avec des dimensions précises
    const screenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
    const screenSurface = new THREE.Mesh(screenGeometry, screenSurfaceMaterial);

    // Positionnement précis de l'écran
    screenSurface.position.set(
        roomDimensions.width / 2,
        roomDimensions.height / 2,
        WALL_THICKNESS / 2 + 0.2
    );

    // Configuration des ombres pour l'écran
    screenSurface.castShadow = true;
    screenSurface.receiveShadow = true;

    // Création d'une surface fine pour l'ombre derrière l'écran
    const shadowPlaneGeometry = new THREE.PlaneGeometry(screenWidth + 2, screenHeight + 2);
    const shadowPlaneMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.1,
        side: THREE.FrontSide,
        depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeometry, shadowPlaneMaterial);
    
    // Positionnement de la surface d'ombre
    shadowPlane.position.set(
        roomDimensions.width / 2,
        roomDimensions.height / 2,
        WALL_THICKNESS / 2 + 0.05
    );

    // S'assurer que l'écran est parfaitement aligné
    screenSurface.rotation.set(0, 0, 0);
    shadowPlane.rotation.set(0, 0, 0);
    frame.rotation.set(0, 0, 0);

    screenSurface.updateMatrix();
    shadowPlane.updateMatrix();
    frame.updateMatrix();

    scene.add(shadowPlane);
    scene.add(frame);
    scene.add(screenSurface);

    // Lumière spécifique pour l'écran avec une meilleure qualité
    const screenSpotLight = new THREE.SpotLight(0xffffff, 0.8);
    screenSpotLight.position.set(
        roomDimensions.width / 2,
        roomDimensions.height / 2 + 30,
        WALL_THICKNESS / 2 + SCREEN_DEPTH + 40
    );
    screenSpotLight.target = screenSurface;
    screenSpotLight.angle = Math.PI / 6;
    screenSpotLight.penumbra = 0.3;
    screenSpotLight.decay = 1.5;
    screenSpotLight.distance = 120;

    scene.add(screenSpotLight);
    scene.add(screenSpotLight.target);

    // Ajout d'une lumière d'ambiance plus douce
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Lumière principale pour les ombres avec configuration améliorée
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);  // Intensité réduite
    mainLight.position.set(
        roomDimensions.width / 2 + 50,  // Légèrement décalé
        roomDimensions.height + 30,     // Plus haut
        roomDimensions.depth / 2        // Au milieu de la pièce
    );
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.bias = -0.0005;
    mainLight.shadow.radius = 2;        // Ombres légèrement plus douces

    // Ajustement de la caméra d'ombre pour la lumière principale
    const shadowCamera = mainLight.shadow.camera;
    shadowCamera.left = -roomDimensions.width;
    shadowCamera.right = roomDimensions.width;
    shadowCamera.top = roomDimensions.height;
    shadowCamera.bottom = -roomDimensions.height;
    shadowCamera.updateProjectionMatrix();

    scene.add(mainLight);

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

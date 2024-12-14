import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';

interface Visualization2DProps {
  screenDimensions: {
    width: number;
    height: number;
    diagonal: number;
  };
  roomDimensions: {
    width: number;
    depth: number;
    height: number;
    screenHeight: number;
  };
}

export const Visualization2D: React.FC<Visualization2DProps> = ({ screenDimensions, roomDimensions }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Observer les changements de taille du conteneur
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Constantes de style
  const MARGIN = 100; // marge en px
  const ARROW_SIZE = 12; // taille des flèches en px
  const EXTENSION_LINE = 25; // longueur des lignes d'extension en px
  const TEXT_OFFSET = 35; // décalage du texte en px

  // Fonction pour formater les dimensions avec les bonnes unités
  const formatDimension = (value: number, isScreenHeight: boolean = false) => {
    if (isScreenHeight) {
      // La hauteur de l'écran est déjà en centimètres
      return `${Math.round(value)} cm`;
    } else {
      // Les dimensions de la pièce sont en centimètres, on les convertit en mètres
      return `${(value / 100).toFixed(2)} m`;
    }
  };

  // Dimensions fixes pour la visualisation
  const FIXED_ROOM_HEIGHT = 600; // hauteur fixe de la pièce en pixels
  const FIXED_ROOM_WIDTH = 800;  // largeur fixe de la pièce en pixels
  const FIXED_SCREEN_HEIGHT = 200; // hauteur fixe de l'écran en pixels augmentée
  const FIXED_SCREEN_WIDTH = 400;  // largeur fixe de l'écran en pixels augmentée

  // Position fixe de l'écran
  const screenX = (FIXED_ROOM_WIDTH - FIXED_SCREEN_WIDTH) / 2;
  const screenY = FIXED_ROOM_HEIGHT * 0.3; // Position plus haute à 30% de la hauteur de la pièce

  // Dimensions fixes pour le rendu
  const scaledRoom = {
    width: FIXED_ROOM_WIDTH,
    depth: FIXED_ROOM_WIDTH,
    height: FIXED_ROOM_HEIGHT
  };

  const scaledScreen = {
    width: FIXED_SCREEN_WIDTH,
    height: FIXED_SCREEN_HEIGHT
  };

  // Styles communs pour les lignes de cote
  const dimensionLineStyle = {
    stroke: '#000',
    strokeWidth: 1.5,
    strokeLinecap: 'square' as const
  };

  const dimensionTextStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    fill: '#000',
    textAnchor: 'middle' as const,
    dominantBaseline: 'middle' as const
  };

  const labelTextStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    fill: '#000',
    fontStyle: 'italic' as const
  };

  // Fonction pour dessiner une ligne de cote horizontale
  const HorizontalDimension = ({ y, width, value, offset = 0 }: { y: number, width: number, value: number, offset?: number }) => (
    <g transform={`translate(0, ${y + offset})`}>
      {/* Lignes d'extension */}
      <line x1="0" y1="0" x2="0" y2={EXTENSION_LINE} {...dimensionLineStyle} />
      <line x1={width} y1="0" x2={width} y2={EXTENSION_LINE} {...dimensionLineStyle} />
      
      {/* Ligne de cote */}
      <line x1="0" y1={EXTENSION_LINE} x2={width} y2={EXTENSION_LINE} stroke="#000" strokeWidth={1.5} />
      
      {/* Flèches */}
      <polygon points={`0,${EXTENSION_LINE} ${ARROW_SIZE},${EXTENSION_LINE - ARROW_SIZE/2} ${ARROW_SIZE},${EXTENSION_LINE + ARROW_SIZE/2}`} fill="#000" />
      <polygon points={`${width},${EXTENSION_LINE} ${width - ARROW_SIZE},${EXTENSION_LINE - ARROW_SIZE/2} ${width - ARROW_SIZE},${EXTENSION_LINE + ARROW_SIZE/2}`} fill="#000" />
      
      {/* Texte */}
      <text x={width/2} y={TEXT_OFFSET} {...dimensionTextStyle}>
        {formatDimension(value)}
      </text>
    </g>
  );

  // Fonction pour dessiner une ligne de cote verticale
  const VerticalDimension = ({ x, y = 0, height, value }: { x: number, y?: number, height: number, value: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      {/* Lignes d'extension */}
      <line x1="0" y1="0" x2={EXTENSION_LINE/3} y2="0" {...dimensionLineStyle} />
      <line x1="0" y1={height} x2={EXTENSION_LINE/3} y2={height} {...dimensionLineStyle} />
      
      {/* Ligne de cote */}
      <line x1={EXTENSION_LINE/3} y1="0" x2={EXTENSION_LINE/3} y2={height} stroke="#000" strokeWidth={1.5} />
      
      {/* Flèches */}
      <polygon points={`${EXTENSION_LINE/3 + ARROW_SIZE/2},${ARROW_SIZE} ${EXTENSION_LINE/3},${0} ${EXTENSION_LINE/3 - ARROW_SIZE/2},${ARROW_SIZE}`} fill="#000" />
      <polygon points={`${EXTENSION_LINE/3 + ARROW_SIZE/2},${height - ARROW_SIZE} ${EXTENSION_LINE/3},${height} ${EXTENSION_LINE/3 - ARROW_SIZE/2},${height - ARROW_SIZE}`} fill="#000" />
      
      {/* Texte hauteur de la piecegit checkout mastergit checkout master
      git pull origin master*/}
      <text x={-TEXT_OFFSET + 20} y={height/2} transform={`rotate(-90, ${-TEXT_OFFSET + 20}, ${height/2})`} {...dimensionTextStyle}>
        {formatDimension(value)}
      </text>
    </g>
  );

  // Vérifier si l'écran est trop haut seulement si la hauteur de la pièce est définie
  const isScreenTooTall = roomDimensions.height > 0 && (roomDimensions.screenHeight + screenDimensions.height) > roomDimensions.height;

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        height: '600px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}
    >
      {isScreenTooTall && (
        <Alert severity="warning" sx={{ position: 'absolute', top: 50 }}>
          Attention : L'écran est trop haut pour la pièce !
        </Alert>
      )}

      <svg
        width={scaledRoom.width + MARGIN * 2}
        height={scaledRoom.height + MARGIN * 2}
        viewBox={`0 0 ${scaledRoom.width + MARGIN * 2} ${scaledRoom.height + MARGIN * 2}`}
      >
        <defs>
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1a5484', stopOpacity: 0.95 }} />
            <stop offset="100%" style={{ stopColor: '#2196f3', stopOpacity: 0.85 }} />
          </linearGradient>
          <filter id="screenShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
          <linearGradient id="screenShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
            <stop offset="45%" style={{ stopColor: 'rgba(255,255,255,0.1)' }} />
            <stop offset="55%" style={{ stopColor: 'rgba(255,255,255,0.1)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN}, ${MARGIN})`}>
          {/* Grille de fond */}
          <g opacity="0.1">
            {Array.from({ length: Math.floor(scaledRoom.width / 50) + 1 }).map((_, i) => (
              <line
                key={`vertical-${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2={scaledRoom.height}
                stroke="#000"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: Math.floor(scaledRoom.height / 50) + 1 }).map((_, i) => (
              <line
                key={`horizontal-${i}`}
                x1="0"
                y1={i * 50}
                x2={scaledRoom.width}
                y2={i * 50}
                stroke="#000"
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* Plafond */}
          <rect
            x="0"
            y="0"
            width={scaledRoom.width}
            height="20"
            fill="#f0f0f0"
            stroke="#ccc"
            strokeWidth="1"
          />
          <text x={scaledRoom.width/2} y="15" {...labelTextStyle}>
            PLAFOND
          </text>

          {/* Sol */}
          <rect
            x="0"
            y={scaledRoom.height - 20}
            width={scaledRoom.width}
            height="20"
            fill="#f0f0f0"
            stroke="#ccc"
            strokeWidth="1"
          />
          <text x={scaledRoom.width/2} y={scaledRoom.height - 5} {...labelTextStyle}>
            SOL
          </text>

          {/* Murs */}
          <rect
            x="0"
            y="0"
            width={scaledRoom.width}
            height={scaledRoom.height}
            fill="none"
            stroke="#ccc"
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Écran avec effets */}
          <g transform={`translate(${screenX}, ${screenY})`}>
            {/* Fond de l'écran avec ombre */}
            <rect
              width={scaledScreen.width}
              height={scaledScreen.height}
              fill="url(#screenGradient)"
              filter="url(#screenShadow)"
              rx="6"
              ry="6"
            />
            
            {/* Effet de brillance */}
            <rect
              width={scaledScreen.width}
              height={scaledScreen.height}
              fill="url(#screenShine)"
              rx="6"
              ry="6"
            />
            
            {/* Bordure de l'écran */}
            <rect
              width={scaledScreen.width}
              height={scaledScreen.height}
              fill="none"
              stroke="#000"
              strokeWidth={3}
              rx="6"
              ry="6"
            />
          </g>

          {/* Cotation de largeur de l'écran */}
          <g transform={`translate(${screenX}, ${screenY + 8})`}>
            {/* Lignes d'extension */}
            <line x1="0" y1="0" x2="0" y2={EXTENSION_LINE/3} {...dimensionLineStyle} />
            <line x1={scaledScreen.width} y1="0" x2={scaledScreen.width} y2={EXTENSION_LINE/3} {...dimensionLineStyle} />
            
            {/* Ligne de cote */}
            <line x1="0" y1={EXTENSION_LINE/3} x2={scaledScreen.width} y2={EXTENSION_LINE/3} stroke="#000" strokeWidth={1.5} />
            
            {/* Flèches */}
            <polygon points={`0,${EXTENSION_LINE/3} ${ARROW_SIZE},${EXTENSION_LINE/3 - ARROW_SIZE/2} ${ARROW_SIZE},${EXTENSION_LINE/3 + ARROW_SIZE/2}`} fill="#000" />
            <polygon points={`${scaledScreen.width},${EXTENSION_LINE/3} ${scaledScreen.width - ARROW_SIZE},${EXTENSION_LINE/3 - ARROW_SIZE/2} ${scaledScreen.width - ARROW_SIZE},${EXTENSION_LINE/3 + ARROW_SIZE/2}`} fill="#000" />
            
            {/* Texte largeur de l'écran*/}
            <text 
              x={scaledScreen.width/2}
              y={TEXT_OFFSET/3+10} 
              style={{ ...dimensionTextStyle, fill: '#000' }}
              dominantBaseline="hanging"
            >
              {formatDimension(screenDimensions.width)}
            </text>
          </g>

          {/* Cotation de hauteur de l'écran */}
          <g transform={`translate(${screenX + scaledScreen.width - 8}, ${screenY})`}>
            {/* Lignes d'extension */}
            <line x1="0" y1="0" x2={-EXTENSION_LINE/3} y2="0" {...dimensionLineStyle} />
            <line x1="0" y1={scaledScreen.height} x2={-EXTENSION_LINE/3} y2={scaledScreen.height} {...dimensionLineStyle} />
            
            {/* Ligne de cote */}
            <line x1={-EXTENSION_LINE/3} y1="0" x2={-EXTENSION_LINE/3} y2={scaledScreen.height} stroke="#000" strokeWidth={1.5} />
            
            {/* Flèches */}
            <polygon points={`${-EXTENSION_LINE/3},${0} ${-EXTENSION_LINE/3 - ARROW_SIZE/2},${ARROW_SIZE} ${-EXTENSION_LINE/3 + ARROW_SIZE/2},${ARROW_SIZE}`} fill="#000" />
            <polygon points={`${-EXTENSION_LINE/3},${scaledScreen.height} ${-EXTENSION_LINE/3 - ARROW_SIZE/2},${scaledScreen.height - ARROW_SIZE} ${-EXTENSION_LINE/3 + ARROW_SIZE/2},${scaledScreen.height - ARROW_SIZE}`} fill="#000" />
            
            {/* Texte hauteur d'écran*/}
            <text 
              x={-TEXT_OFFSET} 
              y={scaledScreen.height/2-15}
              style={{ ...dimensionTextStyle, fill: '#000' }}
              transform={`rotate(90, ${-TEXT_OFFSET}, ${scaledScreen.height/2})`}
            >
              {formatDimension(screenDimensions.height)}
            </text>
          </g>

          {/* Hauteur de l'écran (entre le sol et l'écran) */}
          <g transform={`translate(${screenX + scaledScreen.width/2}, ${screenY + scaledScreen.height})`}>
            {/* Lignes d'extension */}
            <line x1="0" y1="0" x2={-EXTENSION_LINE/3} y2="0" {...dimensionLineStyle} />
            <line x1="0" y1={scaledRoom.height - screenY - scaledScreen.height - 20} x2={-EXTENSION_LINE/3} y2={scaledRoom.height - screenY - scaledScreen.height - 20} {...dimensionLineStyle} />
            
            {/* Ligne de cote */}
            <line x1={-EXTENSION_LINE/3} y1="0" x2={-EXTENSION_LINE/3} y2={scaledRoom.height - screenY - scaledScreen.height - 20} stroke="#000" strokeWidth={1.5} />
            
            {/* Flèches */}
            <polygon points={`${-EXTENSION_LINE/3},${0} ${-EXTENSION_LINE/3 - ARROW_SIZE/2},${ARROW_SIZE} ${-EXTENSION_LINE/3 + ARROW_SIZE/2},${ARROW_SIZE}`} fill="#000" />
            <polygon points={`${-EXTENSION_LINE/3},${scaledRoom.height - screenY - scaledScreen.height - 20} ${-EXTENSION_LINE/3 - ARROW_SIZE/2},${scaledRoom.height - screenY - scaledScreen.height - 20 - ARROW_SIZE} ${-EXTENSION_LINE/3 + ARROW_SIZE/2},${scaledRoom.height - screenY - scaledScreen.height - 20 - ARROW_SIZE}`} fill="#000" />
            
            {/* Texte hauteur de pose écran */}
            <text 
              x={-TEXT_OFFSET}
              y={(scaledRoom.height - screenY - scaledScreen.height - 20)/2}
              style={{ ...dimensionTextStyle, fill: '#000' }}
              transform={`rotate(-90, ${-TEXT_OFFSET}, ${(scaledRoom.height - screenY - scaledScreen.height - 20)/2})`}
            >
              {formatDimension(roomDimensions.screenHeight, true)}
            </text>
          </g>

          {/* Cotation diagonale de l'écran */}
          <g transform={`translate(${screenX}, ${screenY})`}>
            {/* Axe central de l'écran */}
            <line 
              x1="-100" 
              y1={scaledScreen.height/2} 
              x2={scaledScreen.width} 
              y2={scaledScreen.height/2}
              stroke="#000"
              strokeWidth="1"
              strokeDasharray="4,4"
              strokeOpacity="0.3"
            />
            <text
              x="-105"
              y={scaledScreen.height/2 - 5}
              style={{ ...dimensionTextStyle, fontSize: '12px', opacity: 0.5 }}
              textAnchor="end"
            >
              Axe de l'écran
            </text>

            {/* Axe CFO/CFA */}
            <line 
              x1="-100" 
              y1={scaledScreen.height - 30} 
              x2={scaledScreen.width} 
              y2={scaledScreen.height - 30}
              stroke="#000"
              strokeWidth="1"
              strokeDasharray="4,4"
              strokeOpacity="0.3"
            />
            <text
              x="-105"
              y={scaledScreen.height - 35}
              style={{ ...dimensionTextStyle, fontSize: '12px', opacity: 0.5 }}
              textAnchor="end"
            >
              Axe CFO/CFA
            </text>

            {/* Ligne diagonale en pointillés */}
            <line 
              x1="0" 
              y1={scaledScreen.height} 
              x2={scaledScreen.width} 
              y2="0"
              stroke="#000"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            
            {/* Texte diagonale */}
            <text 
              x={scaledScreen.width/2} 
              y={scaledScreen.height/2}
              {...dimensionTextStyle}
              fill="#000"
              transform={`rotate(-${Math.atan2(scaledScreen.height, scaledScreen.width) * (180/Math.PI)}, ${scaledScreen.width/2}, ${scaledScreen.height/2})`}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <tspan dy="-12">{formatDimension(screenDimensions.diagonal)}</tspan>
              <tspan x={scaledScreen.width/2} dy="24">{Math.round(screenDimensions.diagonal / 2.54)}"</tspan>
            </text>
          </g>

          {/* Cotations de la pièce */}
          <VerticalDimension 
            x={scaledRoom.width + MARGIN/4 - 100} 
            y={20} 
            height={scaledRoom.height - 40} 
            value={roomDimensions.height} 
          />
          <text 
            x={scaledRoom.width + MARGIN/2 - 100} 
            y={scaledRoom.height/2} 
            {...labelTextStyle}
            textAnchor="middle"
            transform={`rotate(-90, ${scaledRoom.width + MARGIN/2 - 100}, ${scaledRoom.height/2})`}
          >
            Hauteur de salle
          </text>
        </g>
      </svg>
    </Box>
  );
};

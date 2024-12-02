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
    stroke: '#666',
    strokeWidth: 1.5,
    strokeLinecap: 'square' as const
  };

  const dimensionTextStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    fill: '#333',
    textAnchor: 'middle' as const,
    dominantBaseline: 'middle' as const
  };

  const labelTextStyle = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    fill: '#666',
    fontStyle: 'italic' as const
  };

  // Fonction pour dessiner une ligne de cote horizontale
  const HorizontalDimension = ({ y, width, value, offset = 0 }: { y: number, width: number, value: number, offset?: number }) => (
    <g transform={`translate(0, ${y + offset})`}>
      {/* Lignes d'extension */}
      <line x1="0" y1="0" x2="0" y2={EXTENSION_LINE} {...dimensionLineStyle} />
      <line x1={width} y1="0" x2={width} y2={EXTENSION_LINE} {...dimensionLineStyle} />
      
      {/* Ligne de cote */}
      <line x1="0" y1={EXTENSION_LINE} x2={width} y2={EXTENSION_LINE} {...dimensionLineStyle} />
      
      {/* Flèches */}
      <path d={`M ${ARROW_SIZE} ${EXTENSION_LINE - ARROW_SIZE/2} L 0 ${EXTENSION_LINE} L ${ARROW_SIZE} ${EXTENSION_LINE + ARROW_SIZE/2}`} 
            fill="none" {...dimensionLineStyle} />
      <path d={`M ${width - ARROW_SIZE} ${EXTENSION_LINE - ARROW_SIZE/2} L ${width} ${EXTENSION_LINE} L ${width - ARROW_SIZE} ${EXTENSION_LINE + ARROW_SIZE/2}`} 
            fill="none" {...dimensionLineStyle} />
      
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
      <line x1={EXTENSION_LINE/3} y1="0" x2={EXTENSION_LINE/3} y2={height} {...dimensionLineStyle} />
      
      {/* Flèches */}
      <path 
        d={`M ${EXTENSION_LINE/3 + ARROW_SIZE/2} ${ARROW_SIZE} L ${EXTENSION_LINE/3} 0 L ${EXTENSION_LINE/3 - ARROW_SIZE/2} ${ARROW_SIZE}`} 
        fill="none" 
        {...dimensionLineStyle} 
      />
      <path 
        d={`M ${EXTENSION_LINE/3 + ARROW_SIZE/2} ${height - ARROW_SIZE} L ${EXTENSION_LINE/3} ${height} L ${EXTENSION_LINE/3 - ARROW_SIZE/2} ${height - ARROW_SIZE}`} 
        fill="none" 
        {...dimensionLineStyle} 
      />
      
      {/* Texte */}
      <text x={-TEXT_OFFSET} y={height/2} transform={`rotate(-90, ${-TEXT_OFFSET}, ${height/2})`} {...dimensionTextStyle}>
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
        width={FIXED_ROOM_WIDTH + MARGIN * 2}
        height={FIXED_ROOM_HEIGHT + MARGIN * 2}
        viewBox={`0 0 ${FIXED_ROOM_WIDTH + MARGIN * 2} ${FIXED_ROOM_HEIGHT + MARGIN * 2}`}
      >
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

          {/* Écran */}
          <rect
            x={screenX}
            y={screenY}
            width={scaledScreen.width}
            height={scaledScreen.height}
            fill="#e3f2fd"
            stroke="#2196f3"
            strokeWidth="4"
          />

          {/* Cotation de largeur de l'écran */}
          <g transform={`translate(${screenX}, ${screenY + 8})`}>
            {/* Lignes d'extension */}
            <line x1="0" y1="0" x2="0" y2={EXTENSION_LINE/3} {...dimensionLineStyle} />
            <line x1={scaledScreen.width} y1="0" x2={scaledScreen.width} y2={EXTENSION_LINE/3} {...dimensionLineStyle} />
            
            {/* Ligne de cote */}
            <line x1="0" y1={EXTENSION_LINE/3} x2={scaledScreen.width} y2={EXTENSION_LINE/3} {...dimensionLineStyle} />
            
            {/* Flèches */}
            <path 
              d={`M ${ARROW_SIZE} ${EXTENSION_LINE/3 - ARROW_SIZE/2} L 0 ${EXTENSION_LINE/3} L ${ARROW_SIZE} ${EXTENSION_LINE/3 + ARROW_SIZE/2}`} 
              fill="none" 
              {...dimensionLineStyle} 
            />
            <path 
              d={`M ${scaledScreen.width - ARROW_SIZE} ${EXTENSION_LINE/3 - ARROW_SIZE/2} L ${scaledScreen.width} ${EXTENSION_LINE/3} L ${scaledScreen.width - ARROW_SIZE} ${EXTENSION_LINE/3 + ARROW_SIZE/2}`} 
              fill="none" 
              {...dimensionLineStyle} 
            />
            
            {/* Texte */}
            <text 
              x={scaledScreen.width/2} 
              y={TEXT_OFFSET/3} 
              {...dimensionTextStyle}
              fill="#2196f3"
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
            <line x1={-EXTENSION_LINE/3} y1="0" x2={-EXTENSION_LINE/3} y2={scaledScreen.height} {...dimensionLineStyle} />
            
            {/* Flèches */}
            <path 
              d={`M ${-EXTENSION_LINE/3 + ARROW_SIZE/2} ${ARROW_SIZE} L ${-EXTENSION_LINE/3} 0 L ${-EXTENSION_LINE/3 - ARROW_SIZE/2} ${ARROW_SIZE}`} 
              fill="none" 
              {...dimensionLineStyle} 
            />
            <path 
              d={`M ${-EXTENSION_LINE/3 + ARROW_SIZE/2} ${scaledScreen.height - ARROW_SIZE} L ${-EXTENSION_LINE/3} ${scaledScreen.height} L ${-EXTENSION_LINE/3 - ARROW_SIZE/2} ${scaledScreen.height - ARROW_SIZE}`} 
              fill="none" 
              {...dimensionLineStyle} 
            />
            
            {/* Texte */}
            <text 
              x={-TEXT_OFFSET} 
              y={scaledScreen.height/2}
              {...dimensionTextStyle}
              fill="#2196f3"
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
            <line x1={-EXTENSION_LINE/3} y1="0" x2={-EXTENSION_LINE/3} y2={scaledRoom.height - screenY - scaledScreen.height - 20} {...dimensionLineStyle} />
            
            {/* Flèches */}
            <path 
              d={`M ${-EXTENSION_LINE/3 + ARROW_SIZE/2} ${ARROW_SIZE} L ${-EXTENSION_LINE/3} 0 L ${-EXTENSION_LINE/3 - ARROW_SIZE/2} ${ARROW_SIZE}`} 
              fill="none" 
              {...dimensionLineStyle} 
            />
            <path 
              d={`M ${-EXTENSION_LINE/3 + ARROW_SIZE/2} ${scaledRoom.height - screenY - scaledScreen.height - 20 - ARROW_SIZE} L ${-EXTENSION_LINE/3} ${scaledRoom.height - screenY - scaledScreen.height - 20} L ${-EXTENSION_LINE/3 - ARROW_SIZE/2} ${scaledRoom.height - screenY - scaledScreen.height - 20 - ARROW_SIZE}`} 
              fill="none" 
              {...dimensionLineStyle} 
            />
            
            {/* Texte */}
            <text 
              x={-TEXT_OFFSET} 
              y={(scaledRoom.height - screenY - scaledScreen.height - 20)/2}
              {...dimensionTextStyle}
              transform={`rotate(90, ${-TEXT_OFFSET}, ${(scaledRoom.height - screenY - scaledScreen.height - 20)/2})`}
            >
              {formatDimension(roomDimensions.screenHeight, true)}
            </text>
          </g>

          {/* Cotation diagonale de l'écran */}
          <g transform={`translate(${screenX}, ${screenY})`}>
            {/* Ligne diagonale en pointillés */}
            <line 
              x1="0" 
              y1={scaledScreen.height} 
              x2={scaledScreen.width} 
              y2="0"
              stroke="#2196f3"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            
            {/* Texte */}
            <text 
              x={scaledScreen.width/2} 
              y={scaledScreen.height/2}
              {...dimensionTextStyle}
              fill="#2196f3"
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

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
  const MARGIN = 80; // marge en px
  const ARROW_SIZE = 10; // taille des flèches en px
  const EXTENSION_LINE = 20; // longueur des lignes d'extension en px
  const TEXT_OFFSET = 30; // décalage du texte en px

  // Calculer l'échelle dynamiquement
  const calculateScale = () => {
    if (!containerSize.width || !containerSize.height) return 1;

    const availableWidth = containerSize.width - MARGIN * 2;
    const availableHeight = containerSize.height - MARGIN * 2;

    return Math.min(
      availableWidth / roomDimensions.width,
      availableHeight / roomDimensions.height
    ) * 0.85; // 85% pour laisser de la place aux cotations
  };

  const SCALE_FACTOR = calculateScale();

  // Dimensions mises à l'échelle
  const scaledRoom = {
    width: roomDimensions.width * SCALE_FACTOR,
    depth: roomDimensions.depth * SCALE_FACTOR,
    height: roomDimensions.height * SCALE_FACTOR
  };

  const scaledScreen = {
    width: screenDimensions.width * SCALE_FACTOR,
    height: screenDimensions.height * SCALE_FACTOR
  };

  // Position de l'écran
  const screenX = (scaledRoom.width - scaledScreen.width) / 2;
  const screenY = (roomDimensions.screenHeight * SCALE_FACTOR);

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
        {Math.round(value)} cm / {Math.round(value / 2.54)}"
      </text>
    </g>
  );

  // Fonction pour dessiner une ligne de cote verticale
  const VerticalDimension = ({ x, height, value, offset = 0 }: { x: number, height: number, value: number, offset?: number }) => (
    <g transform={`translate(${x + offset}, 0)`}>
      {/* Lignes d'extension */}
      <line x1="0" y1="0" x2={-EXTENSION_LINE} y2="0" {...dimensionLineStyle} />
      <line x1="0" y1={height} x2={-EXTENSION_LINE} y2={height} {...dimensionLineStyle} />
      
      {/* Ligne de cote */}
      <line x1={-EXTENSION_LINE} y1="0" x2={-EXTENSION_LINE} y2={height} {...dimensionLineStyle} />
      
      {/* Flèches */}
      <path d={`M ${-EXTENSION_LINE - ARROW_SIZE/2} ${ARROW_SIZE} L ${-EXTENSION_LINE} 0 L ${-EXTENSION_LINE + ARROW_SIZE/2} ${ARROW_SIZE}`} 
            fill="none" {...dimensionLineStyle} />
      <path d={`M ${-EXTENSION_LINE - ARROW_SIZE/2} ${height - ARROW_SIZE} L ${-EXTENSION_LINE} ${height} L ${-EXTENSION_LINE + ARROW_SIZE/2} ${height - ARROW_SIZE}`} 
            fill="none" {...dimensionLineStyle} />
      
      {/* Texte */}
      <text x={-TEXT_OFFSET} y={height/2} transform={`rotate(-90, ${-TEXT_OFFSET}, ${height/2})`} {...dimensionTextStyle}>
        {Math.round(value)} cm
      </text>
    </g>
  );

  const isScreenTooTall = (roomDimensions.screenHeight + screenDimensions.height) > roomDimensions.height;

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        p: 2,
        boxSizing: 'border-box'
      }}
    >
      {isScreenTooTall && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Attention : L'écran est trop haut pour la pièce !
        </Alert>
      )}

      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative',
        minHeight: 0 // Important pour que flexGrow fonctionne correctement
      }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${scaledRoom.width + MARGIN * 2} ${scaledRoom.height + MARGIN * 2}`}
          preserveAspectRatio="xMidYMid meet"
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
                {Math.round(screenDimensions.width)} cm / {Math.round(screenDimensions.width / 2.54)}"
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
                {Math.round(screenDimensions.height)} cm / {Math.round(screenDimensions.height / 2.54)}"
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
                {Math.round(roomDimensions.screenHeight)} cm
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
                <tspan dy="-12">{Math.round(screenDimensions.diagonal)} cm</tspan>
                <tspan x={scaledScreen.width/2} dy="24">{Math.round(screenDimensions.diagonal / 2.54)}"</tspan>
              </text>
            </g>

            {/* Cotations de la pièce */}
            <VerticalDimension x={-MARGIN/2} height={scaledRoom.height} value={roomDimensions.height} />
            <text 
              x={-MARGIN} 
              y={scaledRoom.height/2} 
              {...labelTextStyle}
              textAnchor="end"
            >
              Hauteur de salle
            </text>
          </g>
        </svg>
      </Box>
    </Box>
  );
};

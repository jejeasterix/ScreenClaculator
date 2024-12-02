import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';

interface RoomDimensionsData {
  width: number;
  depth: number;
  height: number;
  screenHeight: number;
}

interface Props {
  onDimensionsChange: (dimensions: RoomDimensionsData) => void;
}

export const RoomDimensions: React.FC<Props> = ({ onDimensionsChange }) => {
  const [dimensions, setDimensions] = useState<RoomDimensionsData>({
    width: 0,
    depth: 0,
    height: 0,
    screenHeight: 0
  });

  // États locaux pour les champs de texte
  const [widthInput, setWidthInput] = useState('');
  const [depthInput, setDepthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [screenHeightInput, setScreenHeightInput] = useState('');

  const handleInputChange = (field: keyof RoomDimensionsData, value: string) => {
    // Mettre à jour l'état local du champ
    switch(field) {
      case 'width':
        setWidthInput(value);
        break;
      case 'depth':
        setDepthInput(value);
        break;
      case 'height':
        setHeightInput(value);
        break;
      case 'screenHeight':
        setScreenHeightInput(value);
        break;
    }

    // Convertir et mettre à jour les dimensions si la valeur est valide
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      // Pour la hauteur de l'écran, on garde la valeur en cm
      // Pour les autres dimensions, on convertit de mètres en centimètres
      const newValue = field === 'screenHeight' ? numValue : numValue * 100;
      setDimensions(prev => ({
        ...prev,
        [field]: newValue
      }));
    }
  };

  useEffect(() => {
    onDimensionsChange(dimensions);
  }, [dimensions, onDimensionsChange]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dimensions de la salle
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Largeur de la pièce (m)"
          type="number"
          value={widthInput}
          onChange={(e) => handleInputChange('width', e.target.value)}
          fullWidth
          inputProps={{ step: "0.1" }}
        />
        <TextField
          label="Profondeur de la pièce (m)"
          type="number"
          value={depthInput}
          onChange={(e) => handleInputChange('depth', e.target.value)}
          fullWidth
          inputProps={{ step: "0.1" }}
        />
        <TextField
          label="Hauteur de la pièce (m)"
          type="number"
          value={heightInput}
          onChange={(e) => handleInputChange('height', e.target.value)}
          fullWidth
          inputProps={{ step: "0.1" }}
        />
        <TextField
          label="Hauteur de pose de l'écran (cm)"
          type="number"
          value={screenHeightInput}
          onChange={(e) => handleInputChange('screenHeight', e.target.value)}
          fullWidth
          inputProps={{ step: "1" }}
        />
      </Box>
    </Box>
  );
};

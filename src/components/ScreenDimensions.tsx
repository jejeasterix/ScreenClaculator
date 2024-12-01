import React, { useState, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography 
} from '@mui/material';

interface Dimensions {
  width: number;
  height: number;
  diagonal: number;
}

interface AspectRatio {
  label: string;
  value: number;
}

interface Props {
  onDimensionsChange: (dimensions: Dimensions) => void;
}

const aspectRatios: AspectRatio[] = [
  { label: '16:9', value: 16/9 },
  { label: '4:3', value: 4/3 },
  { label: '21:9', value: 21/9 },
  { label: '16:10', value: 16/10 },
  { label: '5:4', value: 5/4 },
];

export const ScreenDimensions: React.FC<Props> = ({ onDimensionsChange }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(16/9);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    diagonal: 0
  });

  // États locaux pour les champs de texte
  const [widthInput, setWidthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [diagonalInput, setDiagonalInput] = useState('');
  const [inputTimeoutId, setInputTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const convertToInches = (cm: number): number => {
    return Math.round((cm / 2.54) * 10) / 10;
  };

  const convertFromInches = (inches: number): number => {
    return inches * 2.54;
  };

  const handleInputChange = (type: keyof Dimensions, value: string) => {
    // Mettre à jour l'état local immédiatement
    switch(type) {
      case 'width':
        setWidthInput(value);
        break;
      case 'height':
        setHeightInput(value);
        break;
      case 'diagonal':
        setDiagonalInput(value);
        break;
    }

    // Annuler le timeout précédent s'il existe
    if (inputTimeoutId) {
      clearTimeout(inputTimeoutId);
    }

    // Convertir la valeur en nombre
    let numValue: number;
    if (type === 'diagonal' && unit === 'imperial') {
      // Convertir les pouces en centimètres pour le calcul
      numValue = value === '' ? 0 : convertFromInches(parseFloat(value));
    } else {
      numValue = value === '' ? 0 : parseFloat(value);
    }

    if (!isNaN(numValue)) {
      const timeoutId = setTimeout(() => {
        calculateDimensions(type, numValue);
      }, 1000);
      setInputTimeoutId(timeoutId);
    }
  };

  const calculateDimensions = (type: keyof Dimensions, value: number) => {
    const newDimensions = { ...dimensions };
    
    if (type === 'diagonal') {
      const ratio = Math.sqrt(1 + Math.pow(aspectRatio, 2));
      newDimensions.width = value * Math.cos(Math.atan(1/aspectRatio));
      newDimensions.height = newDimensions.width / aspectRatio;
      newDimensions.diagonal = value;
    } else if (type === 'width') {
      newDimensions.width = value;
      newDimensions.height = value / aspectRatio;
      newDimensions.diagonal = Math.sqrt(Math.pow(value, 2) + Math.pow(newDimensions.height, 2));
    } else if (type === 'height') {
      newDimensions.height = value;
      newDimensions.width = value * aspectRatio;
      newDimensions.diagonal = Math.sqrt(Math.pow(newDimensions.width, 2) + Math.pow(value, 2));
    }

    setDimensions(newDimensions);

    // Mettre à jour les champs de saisie avec les nouvelles valeurs
    if (type !== 'width') {
      setWidthInput(newDimensions.width.toFixed(1));
    }
    if (type !== 'height') {
      setHeightInput(newDimensions.height.toFixed(1));
    }
    if (type !== 'diagonal') {
      if (unit === 'metric') {
        setDiagonalInput(newDimensions.diagonal.toFixed(1));
      } else {
        setDiagonalInput(convertToInches(newDimensions.diagonal).toFixed(1));
      }
    }
  };

  // Mettre à jour les champs quand l'unité change
  useEffect(() => {
    if (dimensions.diagonal > 0) {
      if (unit === 'metric') {
        setDiagonalInput(dimensions.diagonal.toFixed(1));
      } else {
        setDiagonalInput(convertToInches(dimensions.diagonal).toFixed(1));
      }
    }
  }, [unit, dimensions.diagonal]);

  // Mettre à jour les champs quand le ratio change
  useEffect(() => {
    if (dimensions.diagonal > 0) {
      calculateDimensions('diagonal', dimensions.diagonal);
    }
  }, [aspectRatio]);

  useEffect(() => {
    onDimensionsChange(dimensions);
  }, [dimensions, onDimensionsChange]);

  useEffect(() => {
    return () => {
      if (inputTimeoutId) {
        clearTimeout(inputTimeoutId);
      }
    };
  }, [inputTimeoutId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dimensions de l'écran
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Rapport hauteur/largeur</InputLabel>
        <Select
          value={aspectRatio}
          label="Rapport hauteur/largeur"
          onChange={(e) => setAspectRatio(Number(e.target.value))}
        >
          {aspectRatios.map((ratio) => (
            <MenuItem key={ratio.label} value={ratio.value}>
              {ratio.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Largeur (cm)"
          type="number"
          value={widthInput}
          onChange={(e) => handleInputChange('width', e.target.value)}
          fullWidth
          inputProps={{ step: "0.1" }}
        />
        <TextField
          label="Hauteur (cm)"
          type="number"
          value={heightInput}
          onChange={(e) => handleInputChange('height', e.target.value)}
          fullWidth
          inputProps={{ step: "0.1" }}
        />
        <Box sx={{ width: '100%', position: 'relative' }}>
          <TextField
            label={`Diagonale ${unit === 'metric' ? '(cm)' : '(pouces)'}`}
            type="number"
            value={diagonalInput}
            onChange={(e) => handleInputChange('diagonal', e.target.value)}
            fullWidth
            inputProps={{ step: "0.1" }}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select
              value={unit}
              size="small"
              onChange={(e) => setUnit(e.target.value as 'metric' | 'imperial')}
            >
              <MenuItem value="metric">cm</MenuItem>
              <MenuItem value="imperial">pouces</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
};

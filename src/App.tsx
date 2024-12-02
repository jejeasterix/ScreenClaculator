import React, { useState } from 'react';
import { Box, Paper, Button, useTheme, useMediaQuery } from '@mui/material';
import { ScreenDimensions } from './components/ScreenDimensions';
import { RoomDimensions } from './components/RoomDimensions';
import { Visualization2D } from './components/Visualization2D';
import { Visualization3D } from './components/Visualization3D';

interface ScreenDimensionsData {
  width: number;
  height: number;
  diagonal: number;
}

interface RoomDimensionsData {
  width: number;
  depth: number;
  height: number;
  screenHeight: number;
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isValidated, setIsValidated] = useState(false);
  const [needsValidation, setNeedsValidation] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensionsData>({
    width: 0,
    height: 0,
    diagonal: 0
  });
  const [validatedScreenDimensions, setValidatedScreenDimensions] = useState<ScreenDimensionsData>({
    width: 0,
    height: 0,
    diagonal: 0
  });

  const [roomDimensions, setRoomDimensions] = useState<RoomDimensionsData>({
    width: 0,
    depth: 0,
    height: 0,
    screenHeight: 0
  });
  const [validatedRoomDimensions, setValidatedRoomDimensions] = useState<RoomDimensionsData>({
    width: 0,
    depth: 0,
    height: 0,
    screenHeight: 0
  });

  const handleValidation = () => {
    // Vérifier que toutes les dimensions sont > 0
    const isScreenValid = Object.values(screenDimensions).every(value => value > 0);
    const isRoomValid = Object.values(roomDimensions).every(value => value > 0);
    
    if (isScreenValid && isRoomValid) {
      setValidatedScreenDimensions(screenDimensions);
      setValidatedRoomDimensions(roomDimensions);
      setIsValidated(true);
      setNeedsValidation(false);
    }
  };

  const handleScreenDimensionsChange = (dimensions: ScreenDimensionsData) => {
    setScreenDimensions(dimensions);
    setNeedsValidation(true);
  };

  const handleRoomDimensionsChange = (dimensions: RoomDimensionsData) => {
    setRoomDimensions(dimensions);
    setNeedsValidation(true);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      p: 2,
      gap: 2
    }}>
      {/* Section des dimensions */}
      <Box sx={{ 
        width: isMobile ? '100%' : '33.33%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Paper elevation={3}>
          <ScreenDimensions 
            onDimensionsChange={handleScreenDimensionsChange}
          />
        </Paper>
        <Paper elevation={3}>
          <RoomDimensions 
            onDimensionsChange={handleRoomDimensionsChange}
          />
        </Paper>
        <Button 
          variant="contained" 
          color={needsValidation ? "primary" : "success"}
          onClick={handleValidation}
          sx={{ height: 48 }}
        >
          {isValidated 
            ? (needsValidation ? 'Mettre à jour la visualisation' : 'Dimensions validées')
            : 'Afficher la visualisation'}
        </Button>
      </Box>

      {/* Section des visualisations */}
      <Box sx={{ 
        width: isMobile ? '100%' : '66.67%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {isValidated ? (
          <>
            <Paper elevation={3} sx={{ flex: 1, minHeight: isMobile ? '40vh' : '45vh' }}>
              <Box sx={{ p: 3 }}>
                <h2>Visualisation 2D</h2>
                <Visualization2D 
                  screenDimensions={validatedScreenDimensions} 
                  roomDimensions={validatedRoomDimensions} 
                />
              </Box>
            </Paper>
            <Paper elevation={3} sx={{ flex: 1, minHeight: isMobile ? '40vh' : '45vh' }}>
              <Box sx={{ p: 3 }}>
                <h2>Visualisation 3D</h2>
                <Visualization3D 
                  screenDimensions={validatedScreenDimensions} 
                  roomDimensions={validatedRoomDimensions} 
                />
              </Box>
            </Paper>
          </>
        ) : (
          <Paper elevation={3} sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 3,
            textAlign: 'center'
          }}>
            <Box>
              <h2>Visualisations</h2>
              <p>Veuillez valider les dimensions pour voir les visualisations</p>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default App;

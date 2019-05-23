import React, { useEffect } from 'react';
import gameLogic from './gameLogic';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const Game = () => {

  useEffect(() => {
    gameLogic();

    document.documentElement.style.overflow = 'hidden';
  }, [])

  return (
    <canvas id="game" width={WIDTH} height={HEIGHT} />
  );
}

export default Game;

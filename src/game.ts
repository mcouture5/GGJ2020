/// <reference path='./headers/phaser.d.ts'/>

import 'phaser';
import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { Credits } from './scenes/Credits';
// import { Instructions } from './scenes/Instructions';
import { GameScene } from './scenes/GameScene';
import { LevelIntro } from './scenes/LevelIntro';
import { HUDScene } from './scenes/HUDScene';

// main game configuration
const config: GameConfig = {
  title: 'GGJ2020',
  width: 1024,
  height: 768,
  type: Phaser.WEBGL,
  parent: 'game',
  scene: [Boot, MainMenu, /*Instructions, */Credits, GameScene, LevelIntro, HUDScene],
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  backgroundColor: '#fff',
  render: { pixelArt: false, antialias: true, autoResize: false }
};

// game class
export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  var game = new Game(config);
});

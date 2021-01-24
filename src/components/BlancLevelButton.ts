import { Scene } from 'phaser';
import { IconButton } from './IconButton';

const cfg = {
    x: 60,
    y: 600,
    icon: {
        baseScale: 0.18,
        texture: 'newFile',
    },
};

export const BlancLevelButton = (scene: Scene, onPointerUp: () => void) =>
    new IconButton(scene, onPointerUp, cfg.x, cfg.y, cfg.icon);

import { Scene } from 'phaser';
import { IconButton } from './IconButton';

const cfg = {
    x: 180,
    y: 600,
    icon: {
        baseScale: 0.18,
        texture: 'trashbin',
    },
};

export const DeleteCityButton = (scene: Scene, onPointerUp: () => void) =>
    new IconButton(scene, onPointerUp, cfg.x, cfg.y, cfg.icon);

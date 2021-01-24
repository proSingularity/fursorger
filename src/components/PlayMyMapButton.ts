import { Scene } from 'phaser';
import { EditorSceneCfg } from '../styles/EditorSceneCfg';
import { IconButton } from './IconButton';

const cfg = {
    x: EditorSceneCfg.playButton.x,
    y: EditorSceneCfg.playButton.y,
    icon: {
        baseScale: 1,
        texture: 'gamepad',
    },
};

export const PlayMyMapButton = (scene: Scene, onPointerUp: () => void) =>
    new IconButton(scene, onPointerUp, cfg.x, cfg.y, cfg.icon);

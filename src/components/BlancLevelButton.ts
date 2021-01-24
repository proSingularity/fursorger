import { Scene } from 'phaser';
import { EditorSceneCfg } from '../styles/EditorSceneCfg';
import { IconButton } from './IconButton';

const cfg = {
    x: EditorSceneCfg.startNewMapButton.x,
    y: EditorSceneCfg.startNewMapButton.y,
    icon: {
        baseScale: 0.18,
        texture: 'newFile',
    },
};

export const BlancLevelButton = (scene: Scene, onPointerUp: () => void) =>
    new IconButton(scene, onPointerUp, cfg.x, cfg.y, cfg.icon);

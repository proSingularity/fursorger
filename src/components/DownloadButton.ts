import { Scene } from 'phaser';
import { EditorSceneCfg } from '../styles/EditorSceneCfg';
import { IconButton } from './IconButton';

const cfg = {
    x: EditorSceneCfg.downloadButton.x,
    y: EditorSceneCfg.downloadButton.y,
    icon: {
        baseScale: 1,
        texture: 'download',
    },
};

export const DownloadButton = (scene: Scene, onPointerUp: () => void) =>
    new IconButton(scene, onPointerUp, cfg.x, cfg.y, cfg.icon);

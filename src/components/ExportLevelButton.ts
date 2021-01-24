import { GameObjects, Scene } from 'phaser';
import { GrowShrinkAnimPlugin } from '../anims/GrowShrinkAnimPlugin';
import { ILevel } from '../levels/ILevel';
import { TextConfig } from '../styles/Text';

export class ExportLevelButton extends GameObjects.Text {
    constructor(scene: Scene, private levelExporter: { get: () => ILevel }) {
        super(scene, 95, 747, 'Export', TextConfig.sm);
        scene.add.existing(this);
        this.setInteractive();
        this.on('pointerup', () => this.saveToFile());
        new GrowShrinkAnimPlugin(scene, this);
    }

    private saveToFile() {
        const level = this.levelExporter.get();
        const data = JSON.stringify(level, null, 4);
        const blob = new Blob([data], {
            type: 'application/json',
        });
        saveAs(blob, 'level.json');
    }
}

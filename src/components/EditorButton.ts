import { GameObjects, Scene } from 'phaser';
import { GrowShrinkAnimPlugin } from '../anims/GrowShrinkAnimPlugin';
import { TextConfig } from '../styles/Text';

export class EditorButton extends GameObjects.Text {
    constructor(scene: Scene, onClick: () => void) {
        super(scene, 155, 747, 'Editor', TextConfig.sm);
        scene.add.existing(this);
        this.setInteractive();
        this.on('pointerup', () => onClick());
        new GrowShrinkAnimPlugin(scene, this);
    }
}

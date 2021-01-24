import { assign } from 'lodash';
import { GameObjects, Scene } from 'phaser';
import { GrowShrinkAnimPlugin } from '../anims/GrowShrinkAnimPlugin';

export class IconButton extends GameObjects.Image {
    private icon: GameObjects.Image & { baseScale: number };
    private readonly baseScale = 0.5;

    /** iconCfg.baseScale must be 1 due to rendering of thin border lines when svg widht or height become non-integer  */
    constructor(
        scene: Scene,
        onPointerUp: () => void,
        x: number,
        y: number,
        iconCfg: { baseScale: number; texture: string }
    ) {
        super(scene, x, y, 'octagon');
        scene.add.existing(this);
        this.setInteractive();
        this.on('pointerup', onPointerUp);
        const icon = this.scene.add.image(x, y, iconCfg.texture);
        this.icon = assign(icon, { baseScale: iconCfg.baseScale });
        this.icon.setScale(iconCfg.baseScale);
        this.setScale(this.baseScale);
        new GrowShrinkAnimPlugin(scene, this);
        new GrowShrinkAnimPlugin(scene, this.icon, {
            maxRelativeScale: 1.15,
            parent: this,
        });
    }
}

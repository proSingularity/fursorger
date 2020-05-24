import { assign } from "lodash";
import { GameObjects, Scene } from "phaser";
import { GrowShrinkAnimPlugin } from "../anims/GrowShrinkAnimPlugin";

export class IconButton extends GameObjects.Image {
    private icon: GameObjects.Image & { baseScale: number };
    private readonly baseScale = 0.5;

    constructor(
        scene: Scene,
        onPointerUp: () => void,
        x: number,
        y: number,
        iconCfg: { baseScale: number; texture: string }
    ) {
        super(scene, x, y, "octagon");
        scene.add.existing(this);
        this.setInteractive();
        this.on("pointerup", onPointerUp);
        const icon = this.scene.add
            .image(x - 5, y - 5, iconCfg.texture)
            .setScale(iconCfg.baseScale);
        this.icon = assign(icon, { baseScale: iconCfg.baseScale });
        this.setScale(this.baseScale);
        new GrowShrinkAnimPlugin(scene, this);
        new GrowShrinkAnimPlugin(scene, this.icon, { parent: this });
    }
}

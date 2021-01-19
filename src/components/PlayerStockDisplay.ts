import { GameObjects, Scene } from 'phaser';
import { MainSceneCfg as Cfg } from '../styles/MainSceneCfg';
import { setTextShadow } from '../styles/setTextShadow';
import { TextConfig } from '../styles/Text';

export class PlayerStockDisplay extends GameObjects.Text {
    constructor(scene: Scene, private dataSrc: () => number) {
        super(
            scene,
            Cfg.playerStock.text.x,
            Cfg.playerStock.text.y,
            '',
            TextConfig.xl
        );
        scene.add.existing(this);
        setTextShadow(this);
        scene.add
            .image(Cfg.playerStock.img.x, Cfg.playerStock.img.y, 'backpack')
            .setScale(0.8);
    }

    public preUpdate() {
        this.setText(`${this.dataSrc()}`);
    }
}

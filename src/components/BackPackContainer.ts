import { Scene } from 'phaser';
import { EditorSceneCfg } from '../styles/EditorSceneCfg';
import { setTextShadow } from '../styles/setTextShadow';
import { TextConfig } from '../styles/Text';

export class BackpackContainer extends Phaser.GameObjects.Container {
    private onBackpackPlus!: () => void;
    private onBackpackMinus!: () => void;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        onBackpackMinus: () => void,
        onBackpackPlus: () => void
    ) {
        super(scene, x, y, []);
        this.onBackpackPlus = onBackpackPlus;
        this.onBackpackMinus = onBackpackMinus;
        scene.add.existing(this);
        this.addStockComponents();
    }

    private addStockComponents() {
        const backpackX = EditorSceneCfg.playerStock.img.x;
        const backpackY = EditorSceneCfg.playerStock.img.y;
        const backpackTextX = EditorSceneCfg.playerStock.text.x;
        const backpackTextY = EditorSceneCfg.playerStock.text.y;
        const backpackImage = this.scene.add
            .image(backpackX, backpackY, 'backpack')
            .setScale(0.8);
        const backpackText = this.scene.add.text(
            backpackTextX,
            backpackTextY,
            '0',
            TextConfig.xl
        );
        setTextShadow(backpackText);

        const backpackButtonY = backpackY + backpackImage.height / 2 - 25;
        const backpackButtonX = backpackTextX + 50;

        const backpackPlus = this.scene.add
            .image(backpackButtonX, backpackButtonY - 20, 'plus')
            .setScale(0.5)
            .setInteractive();
        const backpackMinus = this.scene.add
            .image(backpackButtonX, backpackButtonY + 20, 'minus')
            .setScale(0.5)
            .setInteractive();

        backpackPlus.on('pointerup', () => {
            this.onBackpackPlus();
            backpackText.setText(
                (parseInt(backpackText.text, 10) + 1).toString()
            );
        });
        backpackMinus.on('pointerup', () => {
            const backpackStock = parseInt(backpackText.text, 10);
            if (backpackStock > 0) {
                this.onBackpackMinus();
                backpackText.setText(
                    (parseInt(backpackText.text, 10) - 1).toString()
                );
            }
        });

        const backpackContainer = this.add([
            backpackText,
            backpackImage,
            backpackPlus,
            backpackMinus,
        ]);
    }
}

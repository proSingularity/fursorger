import { Scene } from 'phaser';
const textStyle = {
    font: '48px Metamorphous',
    fill: '#000000',
};

export const PLAYER_STOCK_INDEX = 0;
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
        const backpackX = 680;
        const backpackY = 40;
        const backpackTextY = backpackY - 25;
        const backpackTextX = backpackX + 40;
        const backpackImage = this.scene.add.image(
            backpackX,
            backpackY,
            'backpack'
        );
        const backpackText = this.scene.add.text(
            backpackTextX,
            backpackTextY,
            '0',
            textStyle
        );

        const backpackButtonY = backpackY + backpackImage.height / 2 - 25;
        const backpackButtonX = backpackX - 50;

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

import { GameObjects, Scene } from 'phaser';
import { toHex } from '../styles/Color';

export interface IEconomyHandlers {
    addToStock: (summand: number) => void;
    addToProduction: (summand: number) => void;
}

const textStyle = {
    font: '48px Metamorphous',
    fill: '#000000',
};

enum stateColors {
    chosen = '#4FE490',
    default = '#FFFFFF',
    dragging = '#95EEBC',
}
const TEXT_TO_ICON_OFFSET = -25;
const STOCK_Y = -60;
const PROD_Y = 60;
const BUTTON_X = 100;
const NAME_TEXT_TO_BUTTON_OFFSET = 20;
const MAIN_BUTTON_INDEX = 0;
const STOCK_TEXT_INDEX = 1;
const STOCK_ICON_INDEX = 3;
const PROD_TEXT_INDEX = 2;
const PROD_ICON_INDEX = 4;
const STOCK_PLUS_INDEX = 5;
const STOCK_MINUS_INDEX = 6;
const PRODUCTION_PLUS_INDEX = 7;
const PRODUCTION_MINUS_INDEX = 8;
const NAME_TEXT_INDEX = 9;
export class CityContainer extends Phaser.GameObjects.Container {
    public state: stateColors;
    private economy: { stock: number; production: number };
    private onTranslation: (x: number, y: number) => void;
    private onEconomy: IEconomyHandlers;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        name: string,
        economy: {
            stock: number;
            production: number;
        },
        onEconomy: IEconomyHandlers,
        onTranslation: (x: number, y: number) => void
    ) {
        const mainButton = scene.add.image(0, 0, 'rectangleButton');
        mainButton.setName('mainButton');
        super(scene, x, y, [mainButton]);
        this.setName(name);
        scene.add.existing(this);
        // setSize() is crucial to avoid "gameObject.input is null"
        this.setSize(mainButton.width, mainButton.height);
        this.setInteractions();
        this.economy = economy;
        this.onEconomy = onEconomy;
        this.state = stateColors.default;
        this.onTranslation = onTranslation;
        this.addEconomy();
        // changing the order of lines here implies a change of index constants...
        this.addNameText();
    }

    public deactivate() {
        this.state = stateColors.default;
    }

    public isChosen() {
        return this.state === stateColors.chosen;
    }

    public update() {
        (this.getFirst(
            'name',
            'mainButton'
        ) as Phaser.GameObjects.Image).setTint(toHex(this.state));
        this.updateTextAndButton();

        (this.getButtons() as GameObjects.Image[]).forEach(button => {
            button.setVisible(this.state !== stateColors.default);
        });
    }

    private setInteractions() {
        this.setInteractive();
        this.setDepth(1);
        this.scene.input.setDraggable(this);
        this.defineDrag();
        this.defineClickUp();
        this.defineClickDown();
    }

    private defineClickDown() {
        this.off('pointerup');
        this.defineClickUp();
    }

    private defineDrag() {
        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
            this.onTranslation(dragX, dragY);
            this.state = stateColors.dragging;
        });
    }

    private defineClickUp() {
        // otherwise previous pointerup-listeners will stack
        this.on('pointerup', () => {
            if (this.state === stateColors.dragging) {
                this.state = stateColors.default;
            } else {
                if (this.state === stateColors.chosen) {
                    this.state = stateColors.default;
                } else {
                    this.state = stateColors.chosen;
                }
            }
        });
    }

    private addNameText() {
        const textField = this.scene.add.text(0, 0, this.name, textStyle);
        this.add(textField);
    }

    private addEconomy() {
        this.addEconomyTexts();
        this.addEconomyButtons();
    }

    private addEconomyButtons() {
        const buttonX = BUTTON_X;
        const stockButtonY = STOCK_Y;
        const prodButtonY = PROD_Y;
        const plusStock = this.scene.add
            .image(buttonX, stockButtonY - 20, 'plus')
            .setScale(0.5)
            .setInteractive();
        plusStock.on('pointerup', () => {
            this.economy.stock += 1;
            this.onEconomy.addToStock(1);
        });
        plusStock.setVisible(false);

        const minusStock = this.scene.add
            .image(buttonX, stockButtonY + 20, 'minus')
            .setScale(0.5)
            .setInteractive();
        minusStock.on('pointerup', () => {
            if (this.economy.stock > 0) {
                this.economy.stock -= 1;
                this.onEconomy.addToStock(-1);
            }
        });
        minusStock.setVisible(false);

        const plusProd = this.scene.add
            .image(buttonX, prodButtonY - 20, 'plus')
            .setScale(0.5)
            .setInteractive();
        plusProd.on('pointerup', () => {
            this.economy.production += 1;
            this.onEconomy.addToProduction(1);
        });
        plusProd.setVisible(false);

        const minusProd = this.scene.add
            .image(buttonX, prodButtonY + 20, 'minus')
            .setScale(0.5)
            .setInteractive();

        minusProd.on('pointerup', () => {
            this.economy.production -= 1;
            this.onEconomy.addToProduction(-1);
        });

        minusProd.setVisible(false);

        this.add([plusStock, minusStock, plusProd, minusProd]);
    }

    private getButtons() {
        return [
            this.getAt(STOCK_PLUS_INDEX),
            this.getAt(STOCK_MINUS_INDEX),
            this.getAt(PRODUCTION_MINUS_INDEX),
            this.getAt(PRODUCTION_PLUS_INDEX),
        ];
    }

    private addEconomyTexts() {
        const stock = this.scene.add.image(0, STOCK_Y, 'stock');
        const stockText = this.scene.add.text(
            0 + 40,
            STOCK_Y + TEXT_TO_ICON_OFFSET,
            '',
            textStyle
        );
        stockText.w = 0;
        const production = this.scene.add.image(0, PROD_Y, 'production');
        const prodText = this.scene.add.text(
            0 + 40,
            PROD_Y + TEXT_TO_ICON_OFFSET,
            '',
            textStyle
        );
        prodText.w = 0;
        this.add([stockText, prodText, stock, production]);
    }

    private updateTextAndButton() {
        const prodText = this.getAt(PROD_TEXT_INDEX) as GameObjects.Text;
        prodText.setText(this.economy.production.toString());
        const stockText = this.getAt(STOCK_TEXT_INDEX) as GameObjects.Text;
        stockText.setText(this.economy.stock.toString());
        const nameText = this.getAt(NAME_TEXT_INDEX) as GameObjects.Text;
        nameText.setText(this.name);
        const mainButton = this.getAt(MAIN_BUTTON_INDEX) as GameObjects.Image;
        const xScale =
            (nameText.width + 2 * NAME_TEXT_TO_BUTTON_OFFSET) /
            mainButton.width;
        mainButton.setScale(xScale, 1);
        nameText.x =
            (-mainButton.width * xScale) / 2 + NAME_TEXT_TO_BUTTON_OFFSET;
        nameText.y = -mainButton.height / 2;
    }
}

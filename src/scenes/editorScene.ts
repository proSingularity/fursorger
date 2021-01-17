import { saveAs } from 'file-saver';
import { GameObjects, Scene } from 'phaser';
import { BackgroundImage } from '../components/BackgroundImage';
import { ILevel } from '../levels/ILevel';
import { MainScene } from './mainScene';

const textStyle = {
    font: '48px Metamorphous',
    fill: '#000000',
};

const textToIconOffset = -25;
const NAME_TEXT_TO_BUTTON_OFFSET = 20;
const PRODUCTION_INDEX = 2;
const STOCK_INDEX = 1;

const STORED_LEVEL_KEY = 'STORE_EDITOR';

export class EditorScene extends Scene {
    private containerArray!: GameObjects.Container[];
    private backpackContainer!: GameObjects.Container;
    private backpack: number;
    private travelPathLines!: GameObjects.Graphics;
    private selectedContainer!: GameObjects.Container[];
    private paths!: Array<{ first: string; second: string }>;
    private startIcon!: GameObjects.Image;
    private startCity!: GameObjects.Container;
    private noStartIconDrag!: boolean;

    constructor() {
        super({
            key: 'EditorScene',
        });
    }

    public create(): void {
        // TODO #55 consider moving into title screen

        this.backpack = 0;

        new BackgroundImage(this, 'background2');
        this.travelPathLines = this.add.graphics({
            lineStyle: { width: 4, color: 0x0 },
        });
        this.containerArray = [];
        this.paths = [];
        this.noStartIconDrag = true;
        this.addStartIcon();
        this.selectedContainer = [];
        this.addCityCreationButton();
        this.addBackpackContainer();
        this.addExportLevelButton();
        this.addMainSceneButton();
        const textField = document.createElement('input');
        textField.type = 'text';
        textField.id = 'text';
        this.add.dom(100, 50, textField);
        textField.addEventListener('change', () => {
            if (this.selectedContainer.length === 1) {
                const oldContainerName = this.selectedContainer[0].name;
                this.selectedContainer[0].name = textField.value;
                this.adjustPathsToNameChange(oldContainerName, textField.value);
            }
            textField.value = '';
        });
    }

    public adjustPathsToNameChange(oldName: string, newName: string) {
        this.paths.forEach(path => {
            if (path.first === oldName) {
                path.first = newName;
            }
            if (path.second === oldName) {
                path.second = newName;
            }
        });
    }

    public update() {
        this.updateEdges();
        this.updateTextAndButton();
        (this.backpackContainer.getAt(0) as GameObjects.Text).setText(
            this.backpack.toString()
        );
        if (this.startCity !== undefined && this.noStartIconDrag) {
            this.moveStartIconToCity(this.startCity);
        }
    }

    private addStartIcon() {
        this.startIcon = this.add
            .image(550, 360, 'startArrow')
            .setInteractive();
        this.startIcon.setScale(0.3, 0.3);
        this.input.setDraggable(this.startIcon);
        this.startIcon.on('pointerdown', () => {
            this.noStartIconDrag = false;
            this.startIcon.once('pointerup', () => {
                this.updateStartIconPosition();
                this.noStartIconDrag = true;
            });
        });
    }

    private updateStartIconPosition() {
        this.containerArray.forEach(container => {
            // orientate on size of button which will change size
            const button = container.getAt(0) as GameObjects.Image;
            const width = button.width * button.scaleX;
            const height = button.height * button.scaleY;
            if (
                Math.abs(container.x - this.getStartIconPoint().x) <
                    width / 2 &&
                Math.abs(container.y - this.getStartIconPoint().y) < height / 2
            ) {
                this.startCity = container;
                this.moveStartIconToCity(container);
            }
        });
    }

    private moveStartIconToCity(container: GameObjects.Container) {
        this.startIcon.x = container.x - 50;
        this.startIcon.y = container.y - 80;
    }

    private getStartIconPoint() {
        return {
            x: this.startIcon.x,
            y: this.startIcon.y + 162 * this.startIcon.scaleY,
        };
    }

    private addBackpackContainer() {
        const backpackX = 680;
        const backpackY = 40;
        const backpackTextY = backpackY - 25;
        const backpackTextX = backpackX + 40;
        const backpackImage = this.add.image(backpackX, backpackY, 'backpack');
        const backpackText = this.add.text(
            backpackTextX,
            backpackTextY,
            '',
            textStyle
        );

        const backpackButtonY = backpackY + backpackImage.height / 2 - 25;
        const backpackButtonX = backpackX - 50;

        const backpackPlus = this.add
            .image(backpackButtonX, backpackButtonY - 20, 'plus')
            .setScale(0.5)
            .setInteractive();
        const backpackMinus = this.add
            .image(backpackButtonX, backpackButtonY + 20, 'minus')
            .setScale(0.5)
            .setInteractive();

        backpackPlus.on('pointerup', () => {
            this.backpack += 1;
        });
        backpackMinus.on('pointerup', () => {
            if (this.backpack > 0) {
                this.backpack -= 1;
            }
        });

        const backpackContainer = this.add.container(0, 0, [
            backpackText,
            backpackImage,
            backpackPlus,
            backpackMinus,
        ]);

        this.backpackContainer = backpackContainer;
    }

    private updateEdges() {
        this.travelPathLines.clear();
        this.travelPathLines = this.add.graphics({
            lineStyle: { width: 4, color: 0x0 },
        });
        this.paths.forEach(path => {
            const nodeV = this.containerArray.find(
                container => path.first === container.name
            );
            const nodeW = this.containerArray.find(
                container => path.second === container.name
            );
            const line = new Phaser.Geom.Line(
                nodeV.x,
                nodeV.y,
                nodeW.x,
                nodeW.y
            );
            this.travelPathLines.strokeLineShape(line);
        });
    }

    private updateTextAndButton() {
        this.containerArray.forEach(container => {
            const prodText = container.getAt(
                PRODUCTION_INDEX
            ) as GameObjects.Text;
            prodText.setText(prodText.w.toString());
            const stockText = container.getAt(STOCK_INDEX) as GameObjects.Text;
            stockText.setText(stockText.w.toString());
            const nameText = container.getAt(
                container.length - 1
            ) as GameObjects.Text;
            nameText.setText(container.name);
            const button = container.getAt(0) as GameObjects.Image;
            const xScale =
                (nameText.width + 2 * NAME_TEXT_TO_BUTTON_OFFSET) /
                button.width;
            button.setScale(xScale, 1);
            nameText.x =
                (-button.width * xScale) / 2 + NAME_TEXT_TO_BUTTON_OFFSET;
            nameText.y = -button.height / 2;
        });
    }

    private creationButtonClicked() {
        const button = this.add.image(0, 0, 'rectangleButton');
        const container = this.add.container(230, 170, [button]);
        // setSize() is crucial to avoid "gameObject.input is null"
        container.setSize(button.width, button.height);
        this.addEconomy(container);
        this.addNameText(container);
        container.setInteractive();
        container.setName(this.containerArray.length.toString());
        container.setDepth(1);
        this.input.setDraggable(container);
        this.defineContainerDrag(container);
        this.defineContainerClickUp(container);
        this.defineContainerClickDown(container);
        this.containerArray.push(container);
    }

    private addNameText(container: GameObjects.Container) {
        const textField = this.add.text(0, 0, container.name, textStyle);
        container.add(textField);
    }

    private setButtonVisible(isVisible: boolean) {
        const buttonArray = this.selectedContainer[0].getAll().slice(5, 9);
        buttonArray.forEach(button => {
            (button as GameObjects.Image).setVisible(isVisible);
        });
    }

    private defineContainerClickDown(container: GameObjects.Container) {
        container.on('pointerdown', () =>
            this.defineContainerClickUp(container)
        );
    }

    private setContainerButtonColor(
        container: GameObjects.Container,
        hex: number
    ) {
        (container.getAt(0) as GameObjects.Image).setTint(hex);
    }

    private resetContainerButtonColor(container: GameObjects.Container) {
        (container.getAt(0) as GameObjects.Image).clearTint();
    }

    private defineContainerClickUp(container: GameObjects.Container) {
        // otherwise previous pointerup-listeners will stack
        container.off('pointerup');
        container.on('pointerup', () => {
            this.selectedContainer.push(container);
            if (this.selectedContainer.length === 2) {
                this.resetContainerButtonColor(this.selectedContainer[0]);
                this.resetContainerButtonColor(this.selectedContainer[1]);
                this.setButtonVisible(false);
                this.redrawEdges();
                this.selectedContainer = [];
            } else {
                this.setContainerButtonColor(container, 0x44ff44);
                this.setButtonVisible(true);
            }
        });
    }

    private defineContainerDrag(container: GameObjects.Container) {
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.updateEdges();
            // to prevent turn advance after dragging
            container.off('pointerup');
        });
    }

    private addContainerStock(
        container: GameObjects.Container,
        stockAdd: number
    ) {
        (container.getAt(STOCK_INDEX) as GameObjects.Text).w += stockAdd;
    }

    private addContainerProduction(
        container: GameObjects.Container,
        productionAdd: number
    ) {
        (container.getAt(
            PRODUCTION_INDEX
        ) as GameObjects.Text).w += productionAdd;
    }

    private addCityCreationButton() {
        const creationButton = this.add
            .image(this.scale.width - 100, this.scale.height - 100, 'plus')
            .setInteractive();

        creationButton.on('pointerup', () => {
            this.creationButtonClicked();
        });
    }

    private redrawEdges() {
        const cityPair = this.selectedContainer;
        if (cityPair.length !== 2) {
            throw new Error(
                'selectedCities has wrong length for redrawEdges()'
            );
        }
        const firstName = cityPair[0].name;
        const secondName = cityPair[1].name;

        if (!this.deletePath(firstName, secondName)) {
            if (firstName === secondName) {
                this.selectedContainer = [];
            } else {
                this.paths.push({ first: firstName, second: secondName });
            }
        }
    }

    private deletePath(firstName: string, secondName: string) {
        const remainingPaths = [];
        let didDelete = false;
        this.paths.forEach(path => {
            if (
                (path.first === firstName && path.second === secondName) ||
                (path.first === secondName && path.second === firstName)
            ) {
                didDelete = true;
            } else {
                remainingPaths.push(path);
            }
        });
        this.paths = remainingPaths;
        return didDelete;
    }

    private addEconomy(container: GameObjects.Container) {
        const stockY = -60;
        const prodY = 60;
        const buttonX = 100;
        const stockButtonY = stockY;
        const prodButtonY = prodY;

        const stock = this.add.image(0, stockY, 'stock');
        const stockText = this.add.text(
            0 + 40,
            stockY + textToIconOffset,
            '',
            textStyle
        );
        stockText.w = 0;
        const production = this.add.image(0, prodY, 'production');
        const prodText = this.add.text(
            0 + 40,
            prodY + textToIconOffset,
            '',
            textStyle
        );
        prodText.w = 0;
        container.add([stockText, prodText, stock, production]);

        const plusStock = this.add
            .image(buttonX, stockButtonY - 20, 'plus')
            .setScale(0.5)
            .setInteractive();
        plusStock.on('pointerup', () => {
            this.addContainerStock(container, 1);
        });
        plusStock.setVisible(false);

        const minusStock = this.add
            .image(buttonX, stockButtonY + 20, 'minus')
            .setScale(0.5)
            .setInteractive();
        minusStock.on('pointerup', () => {
            this.addContainerStock(container, -1);
        });
        minusStock.setVisible(false);

        const plusProd = this.add
            .image(buttonX, prodButtonY - 20, 'plus')
            .setScale(0.5)
            .setInteractive();
        plusProd.on('pointerup', () => {
            this.addContainerProduction(container, 1);
        });
        plusProd.setVisible(false);

        const minusProd = this.add
            .image(buttonX, prodButtonY + 20, 'minus')
            .setScale(0.5)
            .setInteractive();

        minusProd.on('pointerup', () => {
            this.addContainerProduction(container, -1);
        });

        minusProd.setVisible(false);

        container.add([plusStock, minusStock, plusProd, minusProd]);
    }

    private productionOfCity(container: GameObjects.Container) {
        return (container.getAt(PRODUCTION_INDEX) as GameObjects.Text).w;
    }

    private stockOfCity(container: GameObjects.Container) {
        return (container.getAt(STOCK_INDEX) as GameObjects.Text).w;
    }

    private generateLevel(): ILevel {
        const cities = this.containerArray.map(container => {
            return {
                name: container.name,
                stock: this.stockOfCity(container),
                production: this.productionOfCity(container),
                x: Math.floor(container.x),
                y: Math.floor(container.y),
            };
        });

        const travelPaths = this.paths;

        return {
            cities,
            travelPaths,
            player: { stock: this.backpack, location: this.startCity.name },
            background: 'background2',
        };
    }

    private addExportLevelButton() {
        const button = this.add
            .image(60, 540, 'export')
            .setInteractive()
            .setScale(100 / 180);
        const saveToFile = () => {
            const data = JSON.stringify(this.generateLevel(), null, 4);
            const blob = new Blob([data], {
                type: 'application/json',
            });
            saveAs(blob, 'level.json');
        };
        button.on('pointerup', saveToFile);
    }

    private addMainSceneButton() {
        const button = this.add
            .image(220, 540, 'play')
            .setInteractive()
            .setScale(100 / 200);

        button.on('pointerup', () => {
            const tryOutLevel = this.generateLevel();
            this.scene.add('mainScene', MainScene, true, {
                level: tryOutLevel,
            });
            const jsonTryOutLevel = JSON.stringify(tryOutLevel);
            localStorage.setItem(STORED_LEVEL_KEY, jsonTryOutLevel);
            const textField = document.getElementById('text');
            textField.remove();
            this.scene.remove(this);
        });
    }
}

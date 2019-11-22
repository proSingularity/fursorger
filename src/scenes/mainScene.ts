import { Graph } from "graphlib";
import { GameObjects, Scene } from "phaser";
import { gameConfig } from "../game-config";
import { BadEndScene } from "./badEndScene";
import { cityConfig } from "./City.config";
import { CityName } from "./CityName";
import { getAllCities, getNode } from "./getNode";
import { GoodEndScene } from "./GoodEndScene";
import { IPlayer } from "./IPlayer";
import { LogicBuilder } from "./logicBuilder";
import { TravelPathKey } from "./TravelPaths";

const PLAYER_INFO_X = 680;

const textStyle = {
    font: "48px Arial",
    fill: "#000000",
};
export class MainScene extends Scene {
    private player!: IPlayer;
    private graph!: Graph;
    private containerArray!: GameObjects.Container[];
    private playerStockInfo!: GameObjects.Text;
    private playerTurnInfo!: GameObjects.Text;
    private buildFactoryButton!: GameObjects.Image;
    private level = 2;

    constructor() {
        super({
            key: "MainScene",
        });
    }

    public preload(): void {
        this.load.image("Athens", "./assets/images/athens3.png");
        this.load.image("Bern", "./assets/images/bern3.png");
        this.load.image("Cairo", "./assets/images/cairo3.png");
        this.load.image("Dublin", "./assets/images/dublin1.png");
        this.load.image("background", "./assets/images/background500x300.png");
        this.load.image("backpack", "./assets/images/backpack64x64.png");
        this.load.image("stock", "./assets/images/storage64x64.png");
        this.load.image(
            "production",
            "./assets/images/decreasing-bars64x64.png"
        );
        this.load.image("plus", "./assets/images/plus64x64.png");
        this.load.image("minus", "./assets/images/minus64x64.png");
        this.load.image("hourglass", "./assets/images/hourglass64x64.png");
        this.load.image(
            "buildFactory",
            "./assets/images/buildFactoryButton128x128.png"
        );

        this.load.audio("background", "./assets/sounds/bgm.mp3");
    }

    public create(): void {
        const logicObjects = LogicBuilder.create((this
            .level as unknown) as TravelPathKey);
        this.player = logicObjects.player;
        this.graph = logicObjects.graph;
        this.addBackgroundMusic();
        this.addBackground();
        // draw edges first, so that cities are drawn on top
        this.drawEdges();
        this.addCities();
        this.addLevelButton();
        this.addPlayerInfo();
    }

    public update() {
        this.playerStockInfo.setText(this.player.stock.toString());
        this.playerTurnInfo.setText(this.player.turn.toString());
        this.updateBuildFactoryButton();
        this.updateCityInfos();
    }

    private addLevelButton() {
        const button = this.add
            .text(50, 500, "Next Level", textStyle)
            .setInteractive();
        button.on("pointerup", () => {
            this.toggleLevel();
        });
    }

    private updateCityInfos() {
        this.containerArray.forEach(container => {
            // getAt(1) returns the stock text
            (container.getAt(1) as GameObjects.Text).setText(
                getNode(
                    this.graph,
                    container.name as CityName
                ).economy.stock.toString()
            );
            // getAt(2) returns the production text
            (container.getAt(2) as GameObjects.Text).setText(
                getNode(
                    this.graph,
                    container.name as CityName
                ).economy.production.toString()
            );
        });
    }

    private updateBuildFactoryButton() {
        if (this.player.factories === 0) {
            this.buildFactoryButton.setAlpha(0.5).disableInteractive();
        } else {
            this.buildFactoryButton.clearAlpha().setInteractive();
        }
    }

    private addPlayerInfo() {
        const IMAGE_TO_TEXT_OFFSET_Y = -25;
        const IMAGE_TO_TEXT_OFFSET_X = 40;
        const STOCK_Y = 40;
        this.add.image(PLAYER_INFO_X, STOCK_Y, "backpack");
        this.playerStockInfo = this.add.text(
            PLAYER_INFO_X + IMAGE_TO_TEXT_OFFSET_X,
            STOCK_Y + IMAGE_TO_TEXT_OFFSET_Y,
            "",
            textStyle
        );

        const TURN_Y = 120;
        this.add.image(PLAYER_INFO_X, TURN_Y, "hourglass");
        this.playerTurnInfo = this.add.text(
            PLAYER_INFO_X + IMAGE_TO_TEXT_OFFSET_X,
            TURN_Y + IMAGE_TO_TEXT_OFFSET_Y,
            "",
            textStyle
        );

        this.buildFactoryButton = this.add
            .image(PLAYER_INFO_X, 220, "buildFactory")
            .setScale(0.5);
        this.buildFactoryButton.on("pointerup", () => {
            this.handleBuildButtonClicked();
        });
    }

    private handleBuildButtonClicked() {
        const locationName = this.player.getLocationName();
        getNode(this.graph, locationName).economy.production++;
        this.player.factories--;
        if (this.isWin()) {
            this.scene.add("GoodEndScene", GoodEndScene, true, {
                x: 400,
                y: 300,
            });
        }
    }

    private isWin() {
        const endangeredCities = getAllCities(this.graph).filter(
            city => city.economy.production < 0
        );
        return endangeredCities.length === 0;
    }

    private addBackgroundMusic() {
        this.sound.add("background").play("", { loop: true });
    }

    private addBackground() {
        this.add
            .image(0, 0, "background")
            .setOrigin(0)
            .setScale(
                (gameConfig.width as number) / 500,
                (gameConfig.height as number) / 300
            );
    }

    private addCities() {
        this.containerArray = [];
        const textToIconOffset = -25;
        getAllCities(this.graph).forEach(city => {
            const name = city.name;
            const button = this.add.image(0, 0, name);
            const stock = this.add.image(0, -60, "stock");
            const stockText = this.add.text(
                40,
                -60 + textToIconOffset,
                "",
                textStyle
            );
            const production = this.add.image(0, 60, "production");
            const prodText = this.add.text(
                40,
                60 + textToIconOffset,
                "",
                textStyle
            );
            const plus = this.add
                .image(-105, -30, "plus")
                .setScale(0.5)
                .setInteractive();
            plus.on("pointerup", () => {
                if (name === this.player.getLocationName()) {
                    this.player.store();
                }
            });

            const minus = this.add
                .image(-105, 30, "minus")
                .setScale(0.5)
                .setInteractive();
            minus.on("pointerup", () => {
                if (name === this.player.getLocationName()) {
                    this.player.take();
                }
            });
            const config = cityConfig[name];
            const container = this.add.container(config.x, config.y, [
                button,
                stockText,
                prodText,
                stock,
                production,
                plus,
                minus,
            ]);
            container.setName(name);
            this.containerArray.push(container);
        });
        this.containerArray.forEach(container => {
            const index = this.containerArray.indexOf(container);
            container.setSize(170, 60);
            if (container.name === this.player.getLocationName()) {
                (container.getAt(0) as GameObjects.Image).setTint(0x44ff44);
            }
            container.setInteractive();
            container.on("pointerup", () => {
                if (
                    // no edges between city and itself
                    this.graph.hasEdge(
                        this.player.getLocationName(),
                        container.name
                    )
                ) {
                    this.player.setLocation(
                        getNode(this.graph, container.name as CityName)
                    );
                    (container.getAt(0) as GameObjects.Image).setTint(0x44ff44);
                    this.containerArray.forEach(cont => {
                        const consumCity = getNode(
                            this.graph,
                            cont.name as CityName
                        );
                        consumCity.economize();
                        if (consumCity.economy.stock < 0) {
                            this.endScene();
                        }
                    });
                    this.containerArray.forEach((other, otherIndex) => {
                        if (!(index === otherIndex)) {
                            const otherImg = other.getAt(
                                0
                            ) as GameObjects.Image;
                            otherImg.clearTint();
                        }
                    });
                }
            });
        });
    }

    private drawEdges() {
        this.graph.edges().forEach(edge => {
            const nodeV = cityConfig[edge.v as CityName];
            const nodeW = cityConfig[edge.w as CityName];
            const line = new Phaser.Geom.Line(
                nodeV.x,
                nodeV.y,
                nodeW.x,
                nodeW.y
            );
            const graphics = this.add.graphics({
                lineStyle: { width: 4, color: 0x0 },
            });
            graphics.strokeLineShape(line);
        });
    }

    private endScene() {
        this.scene.add("badEndScene", BadEndScene, true, { x: 400, y: 300 });
    }

    private toggleLevel() {
        this.level = (this.level % 2) + 1;
        this.scene.restart();
    }
}

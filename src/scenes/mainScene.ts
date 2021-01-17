import { Graph } from 'graphlib';
import { GameObjects, Scene } from 'phaser';
import { addProductionAnim } from '../anims/addProductionAnim';
import { PathAnimator } from '../anims/PathAnimator';
import { BackgroundImage } from '../components/BackgroundImage';
import { Balloon } from '../components/Balloon';
import { BuildFactoryButton } from '../components/BuildFactoryButton';
import { BuildFactoryText } from '../components/BuildFactoryText';
import { City, CityState } from '../components/City';
import { CityImage, NodeName } from '../components/CityImage';
import { CityProductionDisplay } from '../components/CityProductionDisplay';
import { CityStockDisplay } from '../components/CityStockDisplay';
import { DottedLine } from '../components/DottedLine';
import { EditorButton } from '../components/EditorButton';
import { ExportLevelButton } from '../components/ExportLevelButton';
import { ImportLevelButton } from '../components/ImportLevelButton';
import { NameDisplay } from '../components/NameDisplay';
import { NextLevelButton } from '../components/NextLevelButton';
import { PlayerStockDisplay } from '../components/PlayerStockDisplay';
import { PlusMinusButton } from '../components/PlusMinusButton';
import { RestartButton } from '../components/RestartButton';
import { Secret } from '../components/Secret';
import { Shop } from '../components/Shop';
import { TurnDisplay } from '../components/TurnDisplay';
import { DEV } from '../dev-config';
import { ICity, ILevel, IShop } from '../levels/ILevel';
import { levels } from '../levels/index';
import { LogicCity } from '../logic/City';
import { getAllCities, getNode, getNodes } from '../logic/getNode';
import { INode } from '../logic/INode';
import { IPlayer } from '../logic/IPlayer';
import { LogicBuilder } from '../logic/LogicBuilder';
import { getLevel, setLevel } from '../registry/level';
import { LevelExporter } from '../utils/LevelExporter';
import { BadEndScene } from './badEndScene';
import { EditorScene } from './editorScene';
import { GoodEndScene } from './GoodEndScene';

export interface IMainSceneInit {
    level?: ILevel;
}

export class MainScene extends Scene {
    private player!: IPlayer;
    private graph!: Graph;
    private cities!: City[];
    private shops!: Shop[];
    private currentLevel!: ILevel;
    private pathAnimator!: PathAnimator;

    constructor() {
        super({ key: 'MainScene' });
    }

    public init(data: IMainSceneInit): void {
        this.currentLevel = data.level || levels[getLevel(this.registry)];
    }

    public create(): void {
        this.cameras.main.fadeIn(200);
        const cityData = this.currentLevel.cities;
        const shopData = this.currentLevel.shops;
        const logicObjects = LogicBuilder.create(this.currentLevel);
        this.player = logicObjects.player;
        this.graph = logicObjects.graph;
        new BackgroundImage(this, this.currentLevel.background);
        this.addCities(cityData);
        this.addShops(shopData);
        this.setNodesStates();
        this.addGui();
        this.input.keyboard.on('keydown-R', () => this.restart());
        this.addBalloons();
        this.pathAnimator = new PathAnimator(this, this.currentLevel);
        this.currentLevel.secrets?.forEach(
            secretData => new Secret(this, secretData)
        );
    }

    public update() {
        this.pathAnimator.update();
    }

    public restart() {
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.input.removeAllListeners();
            this.scene.restart();
        });
        this.cameras.main.fadeOut(100);
    }

    private addBalloons() {
        this.graph.edges().forEach(edge => {
            this.addBalloonForEdge(edge.v, edge.w);
        });
    }

    private addBalloonForEdge(startCityName: string, targetCityName: string) {
        const allNodes = getNodes(this.graph);
        const startCity = allNodes.find(city => city.name === startCityName);
        const targetCity = allNodes.find(city => city.name === targetCityName);
        new Balloon(this, startCity, targetCity);
        new DottedLine(this, startCity, targetCity);
    }

    private addGui() {
        new BuildFactoryButton(
            this,
            () => this.handleBuildButtonClicked(),
            () => !this.player.isInCity() || !this.player.hasFactory()
        );
        new BuildFactoryText(this, () => this.player.factories);
        new TurnDisplay(this, () => this.player.turn);
        new PlayerStockDisplay(this, () => this.player.stock);
        RestartButton(this, () => this.restart());
        NextLevelButton(this, () => this.toggleLevel());
        const afterLevelParsedCb = (importedLevel: ILevel) => {
            levels.push(importedLevel);
            this.toggleLevel(levels.length - 1);
        };
        new ImportLevelButton(this, afterLevelParsedCb);
        new ExportLevelButton(
            this,
            new LevelExporter(
                () => levels[getLevel(this.registry)],
                () => getNodes(this.graph),
                () => this.player
            )
        );
        new EditorButton(this, () => this.goto('EditorScene', EditorScene));
    }

    private handleBuildButtonClicked() {
        if (this.player.isInCity()) {
            const locationName = this.player.locationName;
            (getNode(this.graph, locationName) as LogicCity).production++;
            this.player.factories--;
            if (this.isWin()) {
                this.win();
            }
        }
    }

    private isWin() {
        const endangeredCities = getAllCities(this.graph).filter(
            city => city.production < 0
        );
        return endangeredCities.length === 0 && !DEV.winDisabled;
    }

    private addCities(cities: ICity[]) {
        this.cities = [];
        cities.forEach(cityData => {
            const city = this.addCity(cityData);
            this.cities.push(city);
            this.setOnNodeClick(city.name, city.citySprite);
        });
    }

    private addShops(shops: IShop[] = []) {
        this.shops = [];
        shops.forEach(({ name, price, x, y }) => {
            const shopImage = new CityImage(this, 0, 0, NodeName.Shop, name);
            const buyButton = new PlusMinusButton(
                this,
                'plus',
                () => {
                    this.player.stock -= price;
                    this.player.factories += 1;
                },
                () => this.player.stock < price
            );
            const nameText = new NameDisplay(this, name);
            const shop = new Shop(this, x, y, name, {
                sprite: shopImage,
                nameText,
                buyButton,
            });
            this.shops.push(shop);
            this.setOnNodeClick(name, shopImage);
        });
    }

    private addCity({ name, x, y }: ICity) {
        const city = getNode(this.graph, name) as LogicCity;
        const cityImage = new CityImage(this, 0, 0, NodeName.City, name);
        const stockText = new CityStockDisplay(this, () => city.stock);
        const productionText = new CityProductionDisplay(
            this,
            () => city.production
        );
        const plusTradeButton = new PlusMinusButton(
            this,
            'plus',
            () => this.player.store(),
            () => this.player.stock === 0
        );
        const minusTradeButton = new PlusMinusButton(
            this,
            'minus',
            () => this.player.take(),
            () => city.stock === 0
        );
        const nameText = new NameDisplay(this, name);
        return new City(this, x, y, name, {
            citySprite: cityImage,
            stockText,
            productionText,
            plusTradeButton,
            minusTradeButton,
            nameText,
        });
    }

    private setOnNodeClick(nodeName: string, nodeImage: GameObjects.Image) {
        nodeImage.on('pointerup', () => {
            const isValidMovement = this.graph.hasEdge(
                this.player.locationName,
                nodeName
            );
            if (isValidMovement) {
                this.moveAndEndTurn(getNode(this.graph, nodeName));
            }
        });
    }

    private moveAndEndTurn(nextLocation: INode) {
        this.pathAnimator.animatePlayerMovement(
            this.player.locationName,
            nextLocation.name
        );
        this.player.move(nextLocation);
        this.cities.forEach(cont => {
            const consumCity = getNode(this.graph, cont.name) as LogicCity;
            consumCity.consumeOrProduce();
            if (consumCity.stock < 0 && !DEV.loseDisabled) {
                this.lose();
            }
        });
        this.setNodesStates();
        this.cities.forEach(city => addProductionAnim(this, city));
    }

    private setNodesStates() {
        const nodes = [...this.cities, ...this.shops];
        nodes.forEach(node => {
            const playerInNeighboringCity = this.graph.hasEdge(
                this.player.locationName,
                node.name
            );
            const playerInCity = node.name === this.player.locationName;
            if (playerInNeighboringCity) {
                node.nextState(CityState.PlayerIsNeighboring);
            } else if (playerInCity) {
                node.nextState(CityState.PlayerInCity);
            } else {
                node.nextState(CityState.Base);
            }
        });
    }

    private win() {
        this.goto('GoodEndScene', GoodEndScene, { turns: this.player.turn });
    }

    private lose() {
        this.scene.add('badEndScene', BadEndScene, true);
    }

    private goto(
        key: string,
        sceneClass: new (name: string) => Scene,
        data?: { [key: string]: {} }
    ) {
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.add(key, sceneClass, true, data);
            this.scene.remove(this);
        });
        this.cameras.main.fadeOut(100);
    }

    private toggleLevel(selectedLevel?: number) {
        const nextLevel = (getLevel(this.registry) + 1) % levels.length;
        setLevel(this.registry, selectedLevel || nextLevel);
        this.restart();
    }
}

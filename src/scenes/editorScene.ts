import { GameObjects, Scene } from 'phaser';
import { BackgroundImage } from '../components/BackgroundImage';
import { BackpackContainer } from '../components/BackPackContainer';
import { BlancLevelButton } from '../components/BlancLevelButton';
import { CityContainer, IEconomyHandlers } from '../components/CityContainer';
import { DeleteCityButton } from '../components/DeleteCityButton';
import { DownloadButton } from '../components/DownloadButton';
import { PlayMyMapButton } from '../components/PlayMyMapButton';
import { defaultLevel } from '../levels/defaultLevel';
import { ICity, ILevel } from '../levels/ILevel';
import { Color, toHex } from '../styles/Color';
import { MainScene } from './mainScene';

const STORED_LEVEL_KEY = 'STORE_EDITOR';

// TODO: make this depending to screen size
const DEFAULT_START_ICON_X = 300;
const DEFAULT_START_ICON_Y = 400;
export class EditorScene extends Scene {
    private containerArray!: CityContainer[];
    private travelPathLines!: GameObjects.Graphics;
    private startIcon!: GameObjects.Image;
    private noStartIconDrag!: boolean;

    // TODO: Orientate on components from file for container extraction and free them of this.level.city..., instead write them like components from component fiel...
    private level!: ILevel;

    constructor() {
        super({
            key: 'EditorScene',
        });
    }

    public create(): void {
        // TODO #267 this.level = JSON.parse(localStorage.getItem(..) || this.level; // etc
        new BackgroundImage(this, this.level.background);
        this.travelPathLines = this.add.graphics({
            lineStyle: { width: 4, color: toHex(Color.Black) },
        });
        this.containerArray = [];
        this.level.cities.forEach(city => {
            this.addNewCityContainer(false, city);
        });
        this.noStartIconDrag = true;
        this.addStartIcon();
        this.addCityCreationButton();
        this.addBackpackContainer();
        this.addExportLevelButton();
        this.addBlankLevelButton();
        this.addDeleteCityButton();
        this.addMainSceneButton();
        const textField = document.createElement('input');
        textField.type = 'text';
        textField.id = 'text';
        this.add.dom(100, 50, textField);
        textField.addEventListener('change', () => {
            const focusedCity = this.getActivatedCities()[0];
            if (focusedCity) {
                const oldContainerName = focusedCity.name;
                focusedCity.setName(textField.value);
                this.adjustLevelToNameChange(oldContainerName, textField.value);
            }
            textField.value = '';
        });
    }

    public init(): void {
        try {
            const storedLevelJSON = localStorage.getItem(STORED_LEVEL_KEY);
            if (storedLevelJSON !== null) {
                this.level = JSON.parse(storedLevelJSON);
            } else {
                this.level = defaultLevel;
            }
        } catch (error) {
            // tslint:disable-next-line: no-console
        }
    }

    public adjustLevelToNameChange(oldName: string, newName: string) {
        this.level.travelPaths.forEach(path => {
            if (path.first === oldName) {
                path.first = newName;
            }
            if (path.second === oldName) {
                path.second = newName;
            }
        });
        this.level.cities.forEach(city => {
            if (city.name === oldName) {
                city.name = newName;
            }
        });
        if (this.level.player.location === oldName) {
            this.level.player.location = newName;
        }
    }

    public update() {
        this.updateEdgeSlopes();
        this.updateEdgeSetting();
        this.containerArray.forEach(city => city.update());
        if (this.noStartIconDrag) {
            this.moveStartIconToCity(this.level.player.location);
        }
    }

    private updateEdgeSetting() {
        const activatedCities = this.getActivatedCities();
        if (activatedCities.length === 2) {
            activatedCities[0].deactivate();
            activatedCities[1].deactivate();
            this.redrawEdgesAfterContainerClick({
                container: activatedCities[0],
                otherContainer: activatedCities[1],
            });
        }
    }

    private getActivatedCities() {
        return this.containerArray.filter(city => city.isChosen());
    }

    private addStartIcon() {
        this.startIcon = this.add
            .image(550, 360, 'startCityArrow')
            .setInteractive();
        this.startIcon.setScale(0.3, 0.3);
        this.input.setDraggable(this.startIcon);
        this.defineStartIconEvents();
    }

    private defineStartIconEvents() {
        this.startIcon.on('drag', (pointer, dragX, dragY) => {
            this.startIcon.x = dragX;
            this.startIcon.y = dragY;
        });
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
            // adjust to size of button which will change size
            const button = container.getAt(0) as GameObjects.Image;
            const width = button.width * button.scaleX;
            const height = button.height * button.scaleY;
            if (
                Math.abs(container.x - this.getStartIconPoint().x) <
                    width / 2 &&
                Math.abs(container.y - this.getStartIconPoint().y) < height / 2
            ) {
                this.level.player.location = container.name;
                this.moveStartIconToCity(container.name);
            }
        });
    }

    private moveStartIconToCity(startCityName: string) {
        const startCityContainer = this.containerArray.find(
            container => container.name === startCityName
        );
        if (startCityContainer) {
            this.startIcon.x = startCityContainer.x - 50;
            this.startIcon.y = startCityContainer.y - 80;
        } else {
            this.startIcon.x = DEFAULT_START_ICON_X;
            this.startIcon.y = DEFAULT_START_ICON_Y;
        }
    }

    private getStartIconPoint() {
        return {
            x: this.startIcon.x,
            y: this.startIcon.y + 162 * this.startIcon.scaleY,
        };
    }

    private addBackpackContainer() {
        new BackpackContainer(
            this,
            0,
            0,
            () => {
                this.level.player.stock--;
            },
            () => {
                this.level.player.stock++;
            }
        );
    }

    private updateEdgeSlopes() {
        this.travelPathLines.clear();
        this.travelPathLines = this.add.graphics({
            lineStyle: { width: 4, color: 0x0 },
        });
        this.level.travelPaths.forEach(path => {
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

    private addNewCityContainer(
        addToLevelCities: boolean,
        city: ICity = {
            production: -1,
            stock: 5,
            name: this.level.cities.length.toString(),
            x: 300,
            y: 400,
        }
    ) {
        if (addToLevelCities) {
            this.level.cities.push(city);
        }
        const cityInList = this.level.cities.find(
            container => city.name === container.name
        );
        const newEconomy = { stock: city.stock, production: city.production };
        const stockAdd = (summand: number) => {
            cityInList.stock += summand;
        };
        const productionAdd = (summand: number) => {
            cityInList.production += summand;
        };
        const onTranslation = (x: number, y: number) => {
            cityInList.x = x;
            cityInList.y = y;
        };
        this.containerArray.push(
            new CityContainer(
                this,
                city.x,
                city.y,
                city.name,
                newEconomy,
                {
                    addToProduction: productionAdd,
                    addToStock: stockAdd,
                } as IEconomyHandlers,
                onTranslation
            )
        );
    }

    private creationButtonClicked() {
        const containerName = this.containerArray.length.toString();
        this.addNewCityContainer(true);
    }

    private addCityCreationButton() {
        const creationButton = this.add
            .image(this.scale.width - 100, this.scale.height - 100, 'plus')
            .setInteractive();

        creationButton.on('pointerup', () => {
            this.creationButtonClicked();
        });
    }

    private redrawEdgesAfterContainerClick(cityPair: {
        container: CityContainer;
        otherContainer: CityContainer;
    }) {
        const firstName = cityPair.container.name;
        const secondName = cityPair.otherContainer.name;

        if (!this.deletePath(firstName, secondName)) {
            this.level.travelPaths.push({
                first: firstName,
                second: secondName,
            });
        }
    }

    private deletePath(firstName: string, secondName: string) {
        const oldNumberOfPaths = this.level.travelPaths.length;
        const remainingPaths = this.level.travelPaths.filter(
            path =>
                (path.first !== firstName || path.second !== secondName) &&
                (path.first !== secondName || path.second !== firstName)
        );
        this.level.travelPaths = remainingPaths;
        return oldNumberOfPaths > remainingPaths.length;
    }

    private addExportLevelButton() {
        const saveToFile = () => {
            /*const data = JSON.stringify(this.level, null, 4);
            const blob = new Blob([data], {
                type: 'application/json',
            });
            saveAs(blob, 'level.json');*/
        };
        DownloadButton(this, saveToFile);
    }

    private addBlankLevelButton() {
        const deleteCitiesAndPaths = () => {
            const cityNames = this.containerArray.map(
                cityContainer => cityContainer.name
            );
            cityNames.forEach(name => this.removeCity(name));
        };
        BlancLevelButton(this, deleteCitiesAndPaths);
    }

    private addDeleteCityButton() {
        const deleteCityByName = () => {
            const chosenCity = this.containerArray.find(city =>
                city.isChosen()
            );
            if (chosenCity) {
                this.removeCity(chosenCity.name);
            }
        };
        DeleteCityButton(this, deleteCityByName);
    }

    private removeCity(cityName: string) {
        this.level.cities = this.level.cities.filter(
            city => city.name !== cityName
        );
        this.level.travelPaths = this.level.travelPaths.filter(
            path => path.first !== cityName && path.second !== cityName
        );
        this.containerArray
            .find(container => container.name === cityName)
            .destroy();
        this.containerArray = this.containerArray.filter(
            container => container.name !== cityName
        );
        if (this.level.player.location === cityName) {
            this.level.player.location = '';
        }
    }

    private addMainSceneButton() {
        const playMap = () => {
            if (this.startCityExists()) {
                this.goToMainScene();
            }
        };
        PlayMyMapButton(this, playMap);
    }

    private startCityExists() {
        return this.containerArray.some(
            container => container.name === this.level.player.location
        );
    }

    private goToMainScene() {
        const tryOutLevel = this.level;
        this.scene.add('mainScene', MainScene, true, {
            level: tryOutLevel,
        });
        const jsonTryOutLevel = JSON.stringify(tryOutLevel);
        localStorage.removeItem(STORED_LEVEL_KEY);
        localStorage.setItem(STORED_LEVEL_KEY, jsonTryOutLevel);
        const textField = document.getElementById('text');
        textField.remove();
        this.scene.remove(this);
    }
}

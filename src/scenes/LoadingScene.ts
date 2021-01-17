import { GameObjects, Scene } from 'phaser';
import { DEV } from '../dev-config';
import { Color, toHex } from '../styles/Color';
import { setDefaultTextStyle, TextConfig } from '../styles/Text';
import { CreditsScene } from './CreditsScene';
import { GoodEndScene } from './GoodEndScene';
import { MainScene } from './mainScene';
import { TitleScene } from './TitleScene';

export class LoadingScene extends Scene {
    private halfWidth!: number;
    private halfHeight!: number;

    constructor() {
        super({ key: 'Loading' });
    }

    public preload() {
        this.halfWidth = this.scale.width / 2;
        this.halfHeight = this.scale.height / 2;

        this.preloadAllAssets();
        this.addTitles();
        this.makeLoadingBar();
    }

    private preloadAllAssets() {
        const img = (filename: string) => `./assets/images/${filename}`;
        const audio = (filename: string) => `./assets/sounds/${filename}`;
        this.load
            .image(
                'rectangleButton',
                ' ./assets/images/blank_rectangle60x160.png'
            )
            .image('goodEnd', img('goodEnd1280×853.jpg'))
            .image('badEnd', img('badEnd640x512.jpg'))
            .image('city', img('town-01-inkarnate387x295.png'))
            .image('background', img('shoaw-whium.jpg'))
            .image('backpack', img('backpack64x64.png'))
            .image('hourglass', img('hourglass64x64.png'))
            .image('background2', img('default-background.jpg'))
            .image('map-tutorial', img('map-tutorial-1.jpg'))
            .image('map-wesnoth', img('map-wesnoth.jpg'))
            .image('buildFactory', img('buildFactoryButton128x128.png'))
            .image('balloon', img('balloon1600x1600.png'))
            .image('stock', img('storage64x64.png'))
            .image('production', img('decreasing-bars64x64.png'))
            .image('play', img('playArrow300x200.png'))
            .image('export', img('export180x120.png'))
            .image('title', img('title.jpg'))
            .image('banner', img('banner.png'))
            .image('startArrow', img('StartArrow140x324.png'))
            .svg('shop', img('shop.svg'))
            .svg('factory', img('power-plant.svg'))
            .svg('restart', img('reload64x64.svg'))
            .svg('arrow-right', img('arrow-right.svg'))
            .audio('background', audio('bgm.mp3'))
            .audio('risingMoon', audio('Rising_Moon_By_RandomMind.mp3'))
            .audio('scribbling', audio('scribbling.mp3'))
            .atlas(
                'shapes',
                'assets/particles/shapes.png',
                './assets/particles/shapes.json'
            )
            .text(
                'wind-particle-effect',
                './assets/particles/wind-particle-effect.json'
            )
            .spritesheet('octagon', img('octagon.png'), {
                frameWidth: 168,
                frameHeight: 168,
            })
            .spritesheet('plus', img('plus-extra.png'), {
                frameWidth: 74,
                frameHeight: 74,
                spacing: 40,
            })
            .spritesheet('wagon', img('wagon.png'), {
                frameWidth: 261 / 3,
                frameHeight: 252 / 3,
                // spacing: 5,
            })
            .spritesheet('minus', img('minus-extra.png'), {
                frameWidth: 74,
                frameHeight: 74,
                spacing: 40,
            });
    }

    private makeLoadingBar() {
        const loadingText = this.make.text({
            x: this.halfWidth,
            y: this.halfHeight - 50,
            text: 'Loading...',
            style: {
                font: '30px Metamorphous',
                fill: Color.White,
            },
        });
        loadingText.setOrigin(0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(toHex(Color.DarkGrey), 0.8);
        progressBox.fillRect(
            this.halfWidth - 320 / 2,
            this.halfHeight,
            320,
            50
        );

        const assetText = this.make.text({
            x: this.halfWidth,
            y: this.halfHeight + 65,
            text: '',
            style: {
                font: '18px Metamorphous',
                fill: Color.White,
            },
        });
        assetText.setOrigin(0.5);

        this.load.on('progress', this.getProgressBarFiller(progressBar));
        this.load.on('fileprogress', this.getAssetTextWriter(assetText));
        this.load.on('complete', () => {
            if (DEV.startInWinScene) {
                this.scene.add('GoodEndScene', GoodEndScene, true);
            } else if (DEV.skipTitle) {
                this.scene.add('MainScene', MainScene, true);
            } else if (DEV.startInCredits) {
                this.scene.add('CreditsScene', CreditsScene, true);
            } else {
                this.scene.add('TitleScene', TitleScene, true);
            }
            this.scene.remove(this);
        });
    }

    private getAssetTextWriter(
        assetText: GameObjects.Text
    ): (file: { key: string }) => void {
        return (file: { key: string }) => {
            assetText.setText(`Loading asset: ${file.key}`);
        };
    }

    private getProgressBarFiller(
        progressBar: GameObjects.Graphics
    ): (count: number) => void {
        return (count: number) => {
            progressBar.clear();
            progressBar.fillStyle(toHex(Color.White));
            progressBar.fillRect(
                this.halfWidth + 10 - 320 / 2,
                this.halfHeight + 10,
                300 * count,
                30
            );
        };
    }

    private addTitles() {
        this.add
            .text(
                this.halfWidth,
                this.halfHeight - 200,
                'Der Fürsorger',
                TextConfig.title
            )
            .setOrigin(0.5);

        const subtitle = this.add
            .text(
                this.halfWidth,
                this.halfHeight - 120,
                'This world is dying. Can you save us?'
            )
            .setOrigin(0.5);
        setDefaultTextStyle(subtitle);
        subtitle.setColor(Color.White);
    }
}

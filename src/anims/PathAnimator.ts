import { cloneDeep } from 'lodash';
import { GameObjects } from 'phaser';
import { CoveredWagon } from '../components/CoveredWagon';
import { DEV } from '../dev-config';
import { ILevel } from '../levels/ILevel';

export class PathAnimator {
    private wagon?: GameObjects.PathFollower;
    private enabled = false; // TODO #208 enable

    constructor(private scene, private currentLevel: ILevel) {
        if (DEV.showPaths) {
            this.showTravelPaths();
        }
    }

    public update() {
        if (!this.enabled) {
            return;
        }
        if (this.wagon) {
            this.wagon.update();
        }
    }

    public animatePlayerMovement(
        currentLocation: string,
        nextLocation: string
    ) {
        if (!this.enabled) {
            return;
        }
        const allPaths = this.currentLevel.travelPaths;
        const rightDirection = allPaths.find(
            p => p.first === currentLocation && p.second === nextLocation
        );
        const reverseDirection = allPaths.find(
            p => p.second === currentLocation && p.first === nextLocation
        );
        const isReverse = !!reverseDirection;
        const path = cloneDeep(rightDirection || reverseDirection);
        const directedPoints = isReverse ? path.points : path.points.reverse();
        if (directedPoints.length === 0) {
            return;
        }
        const points = directedPoints.map(
            ({ x, y }) => new Phaser.Math.Vector2(x, y)
        );
        const curve = new Phaser.Curves.Spline(points);
        if (DEV.showPaths) {
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(1, 0xffffff, 1);
            curve.draw(graphics, 64);
            graphics.fillStyle(0x00ff00, 1);
            for (const point of points) {
                graphics.fillCircle(point.x, point.y, 4);
            }
        }
        const wagon = new CoveredWagon(this.scene, curve);
        wagon.startFollow({
            duration: 15000,
            rotateToPath: true,
            onComplete: () => wagon.destroy(),
            startAt: 0.1,
        });
        if (this.wagon) {
            this.wagon.destroy();
        }
        this.wagon = wagon;
    }

    private showTravelPaths() {
        this.currentLevel.travelPaths.forEach(path => {
            if (path.points?.length === 0) {
                return;
            }
            const points = path.points.map(
                ({ x, y }) => new Phaser.Math.Vector2(x, y)
            );
            const curve = new Phaser.Curves.Spline(points);

            const graphics = this.scene.add.graphics();
            graphics.lineStyle(1, 0xffffff, 1);
            curve.draw(graphics, 64);
            graphics.fillStyle(0x00ff00, 1);
            for (const point of points) {
                graphics.fillCircle(point.x, point.y, 4);
            }
        });
    }
}

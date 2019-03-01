import { StateAnalyzer } from "./StateAnalyzer";
import { request } from "http";
import * as data from "../data/data";
import { SnakeLogger } from "../util/SnakeLogger";
import { TailDodger } from "./TailDodger" ;
import { IGameState,  ECellContents, IMoveInfo, EMoveDirections, IPoint, ISnake, IBoard, IScoredPoint } from "./types";

export const TargetGenerator = class {

    constructor() {

    }

    getPrioritizedPaths (): IPoint[][] {
        const myPosition = StateAnalyzer.getMyPosition();
        const myHunger = StateAnalyzer.getMyHunger();

        const foodPoints = StateAnalyzer.getFoodPoints(0);
        const smallerSnakeHeads = StateAnalyzer.getSmallerHeadPoints();
        const tailTip = StateAnalyzer.getMyTailTip();

        const dodger = new TailDodger(myPosition);
        const foodPaths = dodger.getShortestPaths(foodPoints);
        const agressionPaths = dodger.getShortestPaths(smallerSnakeHeads);
        const tailPath = dodger.getShortestPath(tailTip);

        let prioritizedPaths: IPoint[][];

        if (myHunger < 50) {
            const primaryPaths = foodPaths.concat(agressionPaths);
            this.sortByLength(primaryPaths);
            const sortedPaths = primaryPaths.concat(tailPath);
            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                return StateAnalyzer.isEdgePoint(path[path.length - 1]);
            });

        } else {
            const primaryPaths = foodPaths;
            this.sortByLength(primaryPaths);
            const secondaryPaths = agressionPaths;
            this.sortByLength(secondaryPaths);
            const sortedPaths = primaryPaths.concat(secondaryPaths).concat(tailPath);
            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                return StateAnalyzer.isEdgePoint(path[path.length - 1])
                    && !StateAnalyzer.isFoodPoint(path[path.length - 1]);
            });
        }
        return prioritizedPaths;
    }

    sortByLength(paths: IPoint[][]) {
        paths.sort((a, b) => {
            if (a.length < b.length) {
                return -1;
            } else if (a.length > b.length) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    deprioritizePaths(paths: IPoint[][], condition: (path: IPoint[]) => boolean ): IPoint[][] {
        const deprioritizedPaths: IPoint[][] = [];
        for (let i = 0; i < paths.length; i++) {
            if (condition(paths[i])) {
                const deprioritizedPath = paths.splice(i, 1)[0]; // 0 is the item index, 1 is the count of items you want to remove.
                deprioritizedPaths.push(deprioritizedPath);
                i--;
            }
        }
        return paths.concat(deprioritizedPaths);

    }


};
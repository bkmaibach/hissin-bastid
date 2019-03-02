import { StateAnalyzer } from "./StateAnalyzer";
import { request } from "http";
import * as data from "../data/data";
import { SnakeLogger } from "../util/SnakeLogger";
import { TailDodger } from "./TailDodger" ;
import { IGameState,  ECellContents, IMoveInfo, EMoveDirections, IPoint, ISnake, IBoard, IScoredPoint } from "./types";
import * as _ from "lodash";
import { isArray } from "util";

export const PathPrioritizer = class {

    constructor() {

    }

    getPrioritizedPaths (): IPoint[][] {
        const myPosition = StateAnalyzer.getMyPosition();
        const myHunger = StateAnalyzer.getMyHunger();

        const foodPoints = StateAnalyzer.getFoodPoints(0);
        const smallerSnakeHeads = StateAnalyzer.getSmallerHeadPoints();
        const tailTip = StateAnalyzer.getMyTailTip();

        const startTime = new Date().getTime();

        const dodger = new TailDodger(myPosition);
        const foodPaths = dodger.getShortestPaths(foodPoints);
        const agressionPaths = dodger.getShortestPaths(smallerSnakeHeads);

        const turn = StateAnalyzer.getTurnNumber();

        const endTime = new Date().getTime();

        let tailPaths: IPoint[][] = [];
        if (!_.isEqual(tailTip, myPosition) && turn >= 2) {
            tailPaths = [dodger.getShortestPath(tailTip)];
        }

        SnakeLogger.info(foodPaths.length + agressionPaths.length + tailPaths.length + " paths found in " + (endTime - startTime) + " milliseconds");

        let prioritizedPaths: IPoint[][];

        if (myHunger < 40) {
            const primaryPaths = foodPaths.concat(agressionPaths);
            this.sortByLength(primaryPaths);
            const sortedPaths = primaryPaths.concat(tailPaths);
            if (sortedPaths.length === 0) {
                return sortedPaths;
            }

            SnakeLogger.info("foodPaths is " + JSON.stringify(foodPaths));
            SnakeLogger.info("agressionPaths is " + JSON.stringify(agressionPaths));
            SnakeLogger.info("primaryPaths is " + JSON.stringify(primaryPaths));
            SnakeLogger.info("tailPaths is " + JSON.stringify(tailPaths));


            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                const endPoint = path[path.length - 1];
                return (StateAnalyzer.isEdgePoint(endPoint)
                    && !_.isEqual(endPoint, tailTip))
                    || (StateAnalyzer.howSurrounded(endPoint) > 3 && StateAnalyzer.isFoodPoint(endPoint));
            });


            SnakeLogger.info("prioritizedPaths is " + JSON.stringify(prioritizedPaths));

        } else {
            const primaryPaths = foodPaths;
            this.sortByLength(primaryPaths);
            const secondaryPaths = agressionPaths;
            this.sortByLength(secondaryPaths);
            const sortedPaths = primaryPaths.concat(secondaryPaths).concat(tailPaths);
            if (sortedPaths.length === 0) {
                return sortedPaths;
            }
            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                const endPoint = path[path.length - 1];
                return (StateAnalyzer.isEdgePoint(endPoint)
                    && !StateAnalyzer.isFoodPoint(endPoint)
                    && !_.isEqual(endPoint, tailTip))
                    || (StateAnalyzer.howSurrounded(endPoint) > 4 && StateAnalyzer.isFoodPoint(endPoint));
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
        let i = 0;
        while (typeof paths[i] != "undefined") {
            if (condition(paths[i])) {
                const deprioritizedPath = paths.splice(i, 1)[0]; // 0 is the item index, 1 is the count of items you want to remove.
                deprioritizedPaths.push(deprioritizedPath);
            } else {
                i++;
            }
        }
        return paths.concat(deprioritizedPaths);
    }

};
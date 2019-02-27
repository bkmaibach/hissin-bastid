import { StateAnalyzer } from "./StateAnalyzer";
import { request } from "http";
import * as data from "../data/data";
import { SnakeLogger } from "../util/SnakeLogger";
import { TailDodger } from "../snake/TailDodger" ;
import { IGameState,  ECellContents, IMoveInfo, EMoveDirections, IPoint, ISnake, IBoard, IScoredPoint } from "./types";

export const TargetGenerator = class {

    // TODO
    constructor() {

    }

    selfProximityFactor(point: IPoint): number {

    }

    foodProximityFactor(point: IPoint): number {

    }

    centricityFactor(point: IPoint): number {

    }

    scoreLocations(): IScoredPoint[] {
        const height = StateAnalyzer.getBoardHeight();
        const width = StateAnalyzer.getBoardWidth();
        const returnVal: IScoredPoint[] = [];
        for (let i = 0; i < width; i++) {
            for (let j = 0; i < height; j++) {
                const point: IPoint = {x: i, y: j};
                let score = 1;
                score *= this.selfProximityFactor(point);
                score *= this.foodProximityFactor(point);
                score *= this.centricityFactor(point);
                const scoredPoint = {point, score};
                returnVal.push(scoredPoint);
            }
        }
        return returnVal;
    }
    getSortedTargets () {
        const scoredLocations = this.scoreLocations();
        scoredLocations.sort((oneScoredPoint, another) => {
            if (oneScoredPoint.score < another.score) {
                return -1;
            }
            if (oneScoredPoint.score > another.score) {
                return 1;
            }
            return 0;
        });
        return scoredLocations;
        // const tailTip = StateAnalyzer.getMyTailTip();
        // const targets = StateAnalyzer.getFoodPoints(0);
        // targets.push(tailTip);
        // return targets;
    }
};
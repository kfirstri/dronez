import { Group } from "three"

interface gameSystem {
    uavs: Group[]
    moveUAVs: boolean,
    height: number,
    width: number
}
import { CommandType } from "./utils"

interface Position {
    x: number
    y: number
}
interface UAVConfig {
    position: Position
    name: string
}

interface MapConfig {
    randomBuildings: number = 50
    gridX: number = 30
    gridZ: number = 30
    boxSize: number = 20
    UAVs: UAVConfig[]
}
interface GameConfig {
    canvasElement: HTMLCanvasElement
    mapConfig: MapConfig
}

interface CommandData {
    direction: Position | undefined
    angle: number | undefined
}
interface Command {
    UAVId: string,
    command: CommandType,
    data?: CommandData
}

export { MapConfig, GameConfig, UAVConfig, Position, Command }
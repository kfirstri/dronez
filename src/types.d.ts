
interface Position {
    x: number
    y: number
}
interface UAV {
    position: Position
    name: string
}

interface MapConfig {
    randomBuildings: number = 50
    gridX: number = 30
    gridZ: number = 30
    boxSize: number = 20
    UAVs: UAV[]
}
interface GameConfig {
    canvasElement: HTMLCanvasElement
    mapConfig: MapConfig
}

export { MapConfig, GameConfig, UAV }
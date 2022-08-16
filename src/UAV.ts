import { Group, Scene, Vector3 } from 'three';
import { Command, Position, UAVConfig } from './types'
import { CommandType } from './utils';
import WorldManager from './world'

export default class UAV extends Scene {

  world: WorldManager;
  model: Group;

  gridPosition: Position;
  target: Vector3;

  commands: Command[] = [];

  readonly movementDivider: number;

  constructor(model: Group, world: WorldManager, config: UAVConfig) {

    super()
    this.model = model;
    this.world = world;

    this.gridPosition = config.position;
    this.target = this.position;

    this.add(model);
    this.movementDivider = this.world.stepLength / this.world.boxSize;
  }

  getNextTarget(step: number): Vector3 {

    const command = this.commands[step];

    if (!command) return new Vector3(0, 0, 0);

    console.log(`${this.name} - calcluating target ${step}`);

    if (command.command == CommandType.TAKEOFF) {
      return new Vector3(this.position.x, 100, this.position.z);
    }
    else if (command.command == CommandType.LAND) {
      return new Vector3(this.position.x, 5, this.position.z);
    }
    else if (command.command == CommandType.MOVE) {
      if (command.data?.direction == undefined) {
        throw Error('Missing data');
      }

      const newGridX = this.gridPosition.x + command.data?.direction.x;
      const newGridY = this.gridPosition.y + command.data?.direction.y;

      const newTarget = this.world.getGridBoxCenter(newGridX, newGridY);
      return newTarget;
    }

    return new Vector3(0, 0, 0);

    // const newX = this.target.x + Math.round(Math.random() * 2 - 1);
    // const newY = this.target.y + Math.round(Math.random() * 2 - 1);

    // return {
    //   x: newX < 0 || newX >= this.world.gridX ? this.target.x : newX,
    //   y: newY < 0 || newY >= this.world.gridZ ? this.target.y : newY
    // }
  }

  animate(time: DOMHighResTimeStamp, elapsed: number) {
    console.log(`${this.name} - target - ${this.target.toArray()}`);
    const subVector = new Vector3(this.target.x, this.target.y, this.target.z).sub(this.position);

    const nextX = this.position.x + subVector.x / this.movementDivider;
    const nextY = this.position.y + subVector.y / this.movementDivider;
    const nextZ = this.position.z + subVector.z / this.movementDivider;

    this.lookAt(nextX, this.position.y, nextZ);

    this.position.x = nextX;
    this.position.y = nextY;
    this.position.z = nextZ;
  }
}
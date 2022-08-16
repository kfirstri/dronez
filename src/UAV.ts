import { Group, Scene, Vector3 } from 'three';
import { Command, Position, UAVConfig } from './types'
import { CommandType } from './utils';
import WorldManager from './world'

/**
 * This class inherits from THREE.Scene so it would be possible to just .add UAV into the "world" scene,
 * It icludes inside a clone of the loaded model
 */
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

    this.movementDivider = this.world.stepLength / this.world.boxSize;

    this.add(model);
  }

  /**
   * This horrible method that totally needs refactoring calculated the next location the UAV should fly to.
   * @param step the current step to run
   * @returns a 3d Vector with the next target position
   */
  getNextTarget(step: number): Vector3 {

    const command = this.commands[step];

    if (!command) return new Vector3(0, 0, 0);

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
  }

  /**
   * The main idea was that the UAV always moves (if it needs to) toward the target position
   * @param time animation time
   * @param elapsed elapsed time since start
   */
  animate(time: DOMHighResTimeStamp, elapsed: number) {
    const subVector = this.target.clone().sub(this.position);

    const nextX = this.position.x + subVector.x / this.movementDivider;
    const nextY = this.position.y + subVector.y / this.movementDivider;
    const nextZ = this.position.z + subVector.z / this.movementDivider;

    this.lookAt(nextX, this.position.y, nextZ);

    this.position.x = nextX;
    this.position.y = nextY;
    this.position.z = nextZ;
  }
}
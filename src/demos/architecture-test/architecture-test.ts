import { createGame, StageManager, type StageBlueprint } from '@zylem/game-lib/core';
import { demoAsset } from '../../assets/manifest';

// Define a stage blueprint
const myStageBlueprint: StageBlueprint = {
  id: 'arch-test-stage',
  name: 'Architecture Test',
  entities: [
    {
      id: 'hello-text',
      type: 'text',
      position: [20, 20],
      data: {
        text: 'Hello Data-Driven World!',
        fontSize: 40,
        fontColor: '#00FF00',
      },
    },
    {
      id: 'test-sprite',
      type: 'sprite',
      position: [0.5, 0.5],
      data: {
        size: { x: 1, y: 1, z: 1 },
        images: [{ name: 'ship', file: demoAsset('general/zylem-ship.png') }],
      },
    },
  ],
};

export default function createDemo() {
  StageManager.registerStaticStage(myStageBlueprint.id, myStageBlueprint);

  const game = createGame({ id: 'arch-test', debug: true });
  game.onSetup(() => {
    void game.loadStageFromId(myStageBlueprint.id);
  });
  return game;
}

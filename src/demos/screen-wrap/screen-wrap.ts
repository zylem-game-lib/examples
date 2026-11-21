import { createGame, createStage } from '@zylem/game-lib/core';
import { createSprite, type ZylemSprite } from '@zylem/game-lib/entity';
import { ThrusterBehavior, ScreenWrapBehavior, type ThrusterEntity } from '@zylem/game-lib/behavior';
import { useArrowsForAxes } from '@zylem/game-lib/input';
import { demoAsset } from '../../assets/manifest';

const playerShipImg = demoAsset('general/zylem-ship.png');

export default function createDemo() {
	function playerFactory() {
		const playerShip: ZylemSprite & Partial<ThrusterEntity> = createSprite({
			images: [{ name: 'player-ship', file: playerShipImg }],
		});

		const thruster = playerShip.use(ThrusterBehavior, {
			linearThrust: 5,
			angularThrust: 8,
			linearDamping: 0,
		});

		playerShip.use(ScreenWrapBehavior, {
			width: 30,
			height: 20,
		});

		const BRAKE_STRENGTH = 3;
		playerShip.onUpdate(({ me, inputs }) => {
			const { Horizontal, Vertical } = inputs.p1.axes;

			if (!me.$thruster) return;

			const forward = Math.max(-Vertical.value, 0);
			const linearDamping = Math.max(Vertical.value, 0) * BRAKE_STRENGTH;
			if (thruster.getOptions().linearDamping !== linearDamping) {
				thruster.setOptions({ linearDamping });
			}

			me.$thruster.thrust = forward;
			me.$thruster.rotate = Horizontal.value;
		});

		return playerShip;
	}

	const players = [];
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			const player = playerFactory();
			player.onSetup(({ me }) => {
				me.setPosition(
					i * 1 + Math.random() * 4 - 5,
					j * 1 + Math.random() * 4 - 5,
					0,
				);
			});
			players.push(player);
		}
	}

	const stage = createStage();
	stage.add(...players);
	stage.setInputConfiguration(useArrowsForAxes('p1'));

	const game = createGame(stage);

	return game;
}

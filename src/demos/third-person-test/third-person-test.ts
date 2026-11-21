import { BufferGeometry, Color, Line, LineBasicMaterial, Vector3 } from 'three';
import {
	createCamera,
	createGame,
	createStage,
} from '@zylem/game-lib/core';
import { createBox, createZone } from '@zylem/game-lib/entity';
import { useArrowsForAxes } from '@zylem/game-lib/input';
import { Platformer3DBehavior, Platformer3DState, type Platformer3DEntity } from '@zylem/game-lib/behavior';
import {
	addCameraTarget,
	playgroundPlane,
	playgroundActor,
	playgroundPlatforms,
} from '../../utils';
import { demoAsset } from '../../assets/manifest';

const skybox = demoAsset('general/skybox-default.png');

type DemoPlayer = ReturnType<typeof playgroundActor> & Partial<Platformer3DEntity>;

/** Matches `playgroundPlatforms()` start platform: center y=1, height 0.5. */
const START_PLATFORM_TOP_Y = 1 + 0.5 / 2;
const PLAYER_SPAWN = { x: 0, y: START_PLATFORM_TOP_Y, z: 0 };
const PROXIMITY_RADIUS = 1.25;
const movement = {
	walkSpeed: 6,
	runSpeed: 12,
	jumpForce: 12,
	maxJumps: 2,
	gravity: 9.82,
	groundSpring: { clearance: 0.045, frequencyHz: 7, dampingRatio: 1 },
};

export default function createDemo() {
	const groundPlane = playgroundPlane('dirt');
	const player: DemoPlayer = playgroundActor('player', undefined, PLAYER_SPAWN);

	const platforms = playgroundPlatforms();
	const curb = createBox({
		position: { x: 0, y: START_PLATFORM_TOP_Y + 0.125, z: 1.7 },
		size: { x: 1.9, y: 0.25, z: 1.2 },
		collision: { static: true },
		material: { color: new Color(0xc9aa76) },
	});
	const crate = createBox({
		position: { x: -2, y: START_PLATFORM_TOP_Y + 1.2, z: 1.5 },
		size: { x: 1, y: 2.4, z: 1 },
		collision: { static: false },
		material: { color: new Color(0x657988) },
	});

	const camera = createCamera({
		position: { x: 0, y: 8, z: 7 },
		perspective: 'third-person',
	});

	const platformer = player.use(Platformer3DBehavior, movement);
	// This demo can also run against the currently published kinematic controller.
	const queryNearby = 'getNearbyBodySlots' in platformer && typeof platformer.getNearbyBodySlots === 'function'
		? platformer.getNearbyBodySlots
		: undefined;

	const stage = createStage(
		{
			gravity: new Vector3(0, -9.82, 0),
			backgroundImage: skybox,
		},
		camera,
	).setInputConfiguration(useArrowsForAxes('p1'), {
		p1: { key: { ' ': ['buttons.A'], Shift: ['shoulders.LTrigger'] } },
	});

	const startingZone = createZone({
		position: { x: 0, y: 0, z: 0 },
		size: { x: 10, y: 10, z: 10 },
		onEnter: ({ self, visitor, globals }) => { },
		onExit: ({ self, visitor, globals }) => { },
	});

	const endingZone = createZone({
		position: { x: 0, y: 30, z: 0 },
		size: { x: 10, y: 10, z: 10 },
		onEnter: ({ self, visitor, globals }) => { },
		onExit: ({ self, visitor, globals }) => { },
	});

	stage.add(startingZone);
	stage.add(endingZone);
	stage.add(groundPlane);
	stage.add(player);
	stage.add(...platforms, curb, crate);

	const game = createGame(
		{
			id: 'behaviors-test',
			debug: true,
			resolution: {
				width: 800,
				height: 600,
			},
		},
		stage,
	);

	let facing: number | undefined;
	let animationState: Platformer3DState | undefined;
	const ring = new Line(
		new BufferGeometry().setFromPoints(Array.from({ length: 49 }, (_, i) => {
			const angle = i * Math.PI * 2 / 48;
			return new Vector3(PROXIMITY_RADIUS * Math.cos(angle), 0, PROXIMITY_RADIUS * Math.sin(angle));
		})),
		new LineBasicMaterial({ color: 0xffffff }),
	);
	ring.name = 'Capsule proximity ring';
	let timeToProximityCheck = 0;
	player.onSetup(({ me }) => {
		facing = undefined;
		animationState = undefined;
		timeToProximityCheck = 0;
		addCameraTarget(camera, me);
	});
	player.onDestroy(() => {
		ring.removeFromParent();
		ring.geometry.dispose();
		ring.material.dispose();
	});

	player.onUpdate(({ inputs, me, delta }) => {
		const { p1 } = inputs;

		const horizontal = p1.axes.Horizontal.value;
		const vertical = p1.axes.Vertical.value;
		const jumpHeld = p1.buttons.A.held > 0;
		const runHeld = p1.shoulders.LTrigger.held > 0;

		if (me.$platformer) {
			me.$platformer.moveX = horizontal;
			me.$platformer.moveZ = vertical;
			me.$platformer.jump = jumpHeld;
			me.$platformer.run = runHeld;
		}

		// Drive the actor's facing visually — the wasm capsule is upright-only.
		if (Math.abs(horizontal) > 0.2 || Math.abs(vertical) > 0.2) {
			const yaw = Math.atan2(horizontal, vertical);
			if (yaw !== facing) {
				me.setRotationY(yaw);
				facing = yaw;
			}
		}

		if (queryNearby && me.group && me.colliderDesc && ring.parent !== me.group) {
			// Collider dimensions are in world units. The actor's visual group is scaled.
			ring.scale.set(1, 1, 1).divide(me.group.scale);
			ring.position.fromArray(me.colliderDesc.offset ?? [0, 0, 0]).divide(me.group.scale);
			me.group.add(ring);
		}
		timeToProximityCheck -= delta;
		if (queryNearby && ring.parent && timeToProximityCheck <= 0) {
			const nearby = queryNearby(PROXIMITY_RADIUS);
			ring.material.color.setHex(nearby.length ? 0xffb743 : 0xffffff);
			timeToProximityCheck = 0.1;
		}

		const state = platformer.getState();
		if (me.getLoadState() !== 'ready' || state === animationState) return;
		animationState = state;
		switch (state) {
			case Platformer3DState.Running:
				me.playAnimation({ key: 'running' });
				break;
			case Platformer3DState.Walking:
				me.playAnimation({ key: 'walking' });
				break;
			case Platformer3DState.Jumping:
				me.playAnimation({ key: 'jumping-up', pauseAtEnd: true });
				break;
			case Platformer3DState.Falling:
				me.playAnimation({ key: 'jumping-up', pauseAtEnd: true });
				break;
			case Platformer3DState.Landing:
				me.playAnimation({ key: 'jumping-down', pauseAtEnd: true });
				break;
			case Platformer3DState.Idle:
			default:
				me.playAnimation({ key: 'idle' });
				break;
		}
	});

	return game;
}

import type { Destructible3DHandle } from '@zylem/game-lib/behavior';
import type { ZylemActor } from '@zylem/game-lib/entity';

export function prebakeActorFragments(actor: ZylemActor, destructible: Destructible3DHandle) {
	void destructible.prebakeAsync().catch((error) => {
		console.warn(`Failed to prebake fragments for ${actor.name}`, error);
	});
}

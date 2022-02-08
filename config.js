import { v4 as uuidv4 } from 'uuid';

const ENTITIES = 20_000;

export let saveConfig = {
	enableFogOfWar: true,
	entities: [],
	factions: [
		{
			color: 'red',
			name: 'Humans'
		},
		{
			color: 'blue',
			name: 'Orcs'
		}
	],
	gameTime: 75931.69666668924,
	nextLevel: 'level2-brief',
	playerFaction: 'Human',
	playerTime: 56794.306666684985,
	type: 'RTS'
};
for(let i = 0; i < ENTITIES; i++) {
	saveConfig.entities.push({
		id: uuidv4(),
		faction: 'Human',
		type: 'Peasant',
		x: i,
		y: i * 10
	});
}
export let updatesConfig = {
	entities: [
		{
			id: uuidv4(),
			x: 100
		},
		{
			id: uuidv4(),
			y: 100.1
		},
		{
			id: uuidv4(),
			x: 100.4,
			y: 100
		},
		{
			id: uuidv4(),
			x: 50
		},
		{
			id: uuidv4(),
			x: 60,
			y: 20
		},
		{
			id: uuidv4(),
			y: 10.5
		},
		{
			id: uuidv4(),
			x: 100
		}
	]
};
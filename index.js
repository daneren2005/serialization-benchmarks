import Avro from '@avro/types';
import { decode, encode } from 'cbor-x';
import { Type } from 'js-binary';
import { v4 as uuidv4 } from 'uuid';
import { compressSync } from 'snappy';

const ENTITIES = 20_000;
const TIMES_TO_RUN = 100;
const SMALL_ENCODE_TIMES_TO_RUN = 10_000;

let saveConfig = {
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
let updatesConfig = {
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


runBenchmark({
	name: 'json',
	encode: (config) => JSON.stringify(config),
	decode: (encoded) => JSON.parse(encoded)
});

let entityAvscSchema = {
	type: 'record',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'faction', type: 'string' },
		{ name: 'type', type: 'string' },
		{ name: 'x', type: 'float' },
		{ name: 'y', type: 'float' }
	]
};
runBenchmark({
	name: 'avsc',
	encode: (config, { schema }) => schema.toBuffer(config),
	decode: (encoded, { schema }) => schema.fromBuffer(encoded),
	params: {
		save: {
			schema: Avro.Type.forSchema({
				name: 'saveConfig',
				type: 'record',
				fields: [
					{ name: 'enableFogOfWar', type: 'boolean' },
					{
						name: 'entities',
						type: {
							type: 'array',
							items: entityAvscSchema
						}
					},
					{
						name: 'factions',
						type: {
							type: 'array',
							items: {
								type: 'record',
								fields: [
									{ name: 'color', type: 'string' },
									{ name: 'name', type: 'string' }
								]
							}
						}
					},
					{ name: 'gameTime', type: 'float' },
					{ name: 'nextLevel', type: 'string' },
					{ name: 'playerFaction', type: 'string' },
					{ name: 'playerTime', type: 'float' },
					{ name: 'type', type: 'string' }
				]
			})
		},
		entity: {
			schema: Avro.Type.forSchema(entityAvscSchema)
		},
		updates: {
			schema: Avro.Type.forSchema({
				name: 'saveConfig',
				type: 'record',
				fields: [
					{
						name: 'entities',
						type: {
							type: 'array',
							items: [{
								type: 'record',
								fields: [
									{ name: 'id', type: 'string' },
									{ name: 'x', type: ['float', 'null'], default: null },
									{ name: 'y', type: ['float', 'null'], default: null }
								]
							}]
						}
					}
				]
			})
		}
	}
});

runBenchmark({
	name: 'cbor-x',
	encode: (config) => encode(config),
	decode: (encoded) => decode(encoded)
});

runBenchmark({
	name: 'js-binary',
	encode: (config, { schema }) => schema.encode(config),
	decode: (encoded, { schema }) => schema.decode(encoded),
	params: {
		save: {
			schema: new Type({
				enableFogOfWar: 'boolean',
				entities: [
					{
						id: 'string',
						faction: 'string',
						type: 'string',
						x: 'float',
						y: 'float'
					}
				],
				factions: [
					{
						color: 'string',
						name: 'string'
					}
				],
				gameTime: 'float',
				nextLevel: 'string',
				playerFaction: 'string',
				playerTime: 'float',
				type: 'string'
			})
		},
		entity: {
			schema: new Type({
				id: 'string',
				faction: 'string',
				type: 'string',
				x: 'float',
				y: 'float'
			})
		},
		updates: {
			schema: new Type({
				entities: [
					{
						id: 'string',
						'x?': 'float',
						'y?': 'float'
					}
				]
			})
		}
	}
});



function runBenchmark({ name, encode, decode, params }) {
	runBenchmarkWithConfig(name, 'save', saveConfig, encode, decode, params ?? {});
	runBenchmarkWithConfig(name, 'entity', saveConfig.entities[0], encode, decode, params ?? {}, SMALL_ENCODE_TIMES_TO_RUN);
	runBenchmarkWithConfig(name, 'updates', updatesConfig, encode, decode, params ?? {}, SMALL_ENCODE_TIMES_TO_RUN);
	console.log('');
	console.log('');
}

function runBenchmarkWithConfig(name, configName, config, encode, decode, params, runTimes = 1) {
	let encodeResults = [];
	let result;
	for(let i = 0; i < TIMES_TO_RUN; i++) {
		let start = (new Date()).getTime();
		for(let j = 0; j < runTimes; j++) {
			result = encode(config, params[configName] ?? {});
		}
		let end = (new Date()).getTime();

		encodeResults.push(end - start);
	}

	let decodeResults = [];
	for(let i = 0; i < TIMES_TO_RUN; i++) {
		let start = (new Date()).getTime();
		for(let j = 0; j < runTimes; j++) {
			decode(result, params[configName] ?? {});
		}
		let end = (new Date()).getTime();

		decodeResults.push(end - start);
	}

	console.log(`${name} ${configName} size: ${result.length.toLocaleString("en-US")} chars`);
	let compressed;
	let compressResults = [];
	for(let i = 0; i < TIMES_TO_RUN; i++) {
		let start = (new Date()).getTime();
		for(let j = 0; j < runTimes; j++) {
			compressed = compressSync(result);
		}
		let end = (new Date()).getTime();

		compressResults.push(end - start);
	}
	console.log(`${name} ${configName} compressed: ${compressed.length.toLocaleString("en-US")} chars`);

	reportStatsFromResults(name, configName, 'encode', encodeResults, runTimes);
	reportStatsFromResults(name, configName, 'decode', decodeResults, runTimes);
	reportStatsFromResults(name, configName, 'compress', compressResults, runTimes);
	console.log('');
}

function reportStatsFromResults(name, configName, type, results, runTimes) {
	let unit = 'ms';
	let fixedUnits = 1;
	if(runTimes >= 1_000) {
		unit = 'ns';
		runTimes = runTimes / 1_000;
		results = results.map(result => result / runTimes);
		if(runTimes >= 10) {
			fixedUnits = 2;
		}
	}

	let average = results.reduce((a, b) => a + b, 0) / results.length;
	let min = Math.min(...results);
	let max = Math.max(...results);
	let standardMeanResults = results.map(val => Math.sqrt((val - average) ** 2));
	let standardDeviation = Math.sqrt(standardMeanResults.reduce((a, b) => a + b, 0) / results.length);

	console.log(`${name} ${configName} average ${type}: ${average.toFixed(fixedUnits)}${unit} (${min}${unit} - ${max}${unit} std dev ${standardDeviation.toFixed(fixedUnits)}${unit})`);
}
import Avro from '@avro/types';
import { decode, Decoder, encode, Encoder } from 'cbor-x';
import { Type } from 'js-binary';
import { runBenchmark, printResultTables } from './run-benchmark.js';


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
	name: 'cbor-x-encoder',
	encode: (config, { encoder }) => encoder.encode(config),
	decode: (encoded, { decoder }) => decoder.decode(encoded),
	params: {
		save: {
			// Passing separate Encoder vs Decoder just to make sure they aren't sharing a cache since they wouldn't in real usage - doesn't seem to make any difference in performance
			encoder: new Encoder(),
			decoder: new Decoder()
		},
		entity: {
			encoder: new Encoder(),
			decoder: new Decoder()
		},
		updates: {
			encoder: new Encoder(),
			decoder: new Decoder()
		}
	}
});

runBenchmark({
	name: 'cbor-x-structured',
	encode: (config, { encoder }) => encoder.encode(config),
	decode: (encoded, { decoder }) => decoder.decode(encoded),
	params: {
		save: {
			encoder: new Encoder({ structuredClone: true }),
			decoder: new Decoder({ structuredClone: true })
		},
		entity: {
			encoder: new Encoder({ structuredClone: true }),
			decoder: new Decoder({ structuredClone: true })
		},
		updates: {
			encoder: new Encoder({ structuredClone: true }),
			decoder: new Decoder({ structuredClone: true })
		}
	}
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


printResultTables();
import { saveConfig, updatesConfig } from './config.js';
import { compressSync } from 'snappy';

const TIMES_TO_RUN = 1_000;
const WARMUP_RUNS = 10;
const SMALL_ENCODE_TIMES_TO_RUN = 10_000;

let rawTableResults = {};
let percentTableResults = {};
let basePercentResults = {};

export function runBenchmark({ name, encode, decode, params }) {
	runBenchmarkWithConfig(name, 'save', saveConfig, encode, decode, params ?? {});
	runBenchmarkWithConfig(name, 'entity', saveConfig.entities[0], encode, decode, params ?? {}, SMALL_ENCODE_TIMES_TO_RUN);
	runBenchmarkWithConfig(name, 'updates', updatesConfig, encode, decode, params ?? {}, SMALL_ENCODE_TIMES_TO_RUN);
	console.log('');
	console.log('');
}

function runBenchmarkWithConfig(name, configName, config, encode, decode, params, runTimes = 1) {
	if(!rawTableResults[configName]) {
		rawTableResults[configName] = percentTableResults[configName] = '| Library  | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |\n| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |';
	}
	rawTableResults[configName] += '\n';
	percentTableResults[configName] += '\n';

	let encodeResults = [];
	let result;
	for(let i = 0; i < TIMES_TO_RUN + WARMUP_RUNS; i++) {
		let start = (new Date()).getTime();
		for(let j = 0; j < runTimes; j++) {
			result = encode(config, params[configName] ?? {});
		}
		let end = (new Date()).getTime();

		if(i >= WARMUP_RUNS) {
			encodeResults.push(end - start);
		}
	}

	let decodeResults = [];
	for(let i = 0; i < TIMES_TO_RUN + WARMUP_RUNS; i++) {
		let start = (new Date()).getTime();
		for(let j = 0; j < runTimes; j++) {
			decode(result, params[configName] ?? {});
		}
		let end = (new Date()).getTime();

		if(i >= WARMUP_RUNS) {
			decodeResults.push(end - start);
		}
	}

	if(!basePercentResults[configName]) {
		basePercentResults[configName] = {};
	}
	if(!basePercentResults[configName].size) {
		basePercentResults[configName].size = result.length;
	}
	rawTableResults[configName] += '| ' + name + ' | ' + result.length.toLocaleString("en-US");
	percentTableResults[configName] += '| ' + name + ' | ' + (result.length / basePercentResults[configName].size * 100).toFixed(0) + '%';
	console.log(`${name} ${configName} size: ${result.length.toLocaleString("en-US")} chars`);
	let compressed;
	let compressResults = [];
	for(let i = 0; i < TIMES_TO_RUN + WARMUP_RUNS; i++) {
		let start = (new Date()).getTime();
		for(let j = 0; j < runTimes; j++) {
			compressed = compressSync(result);
		}
		let end = (new Date()).getTime();

		if(i >= WARMUP_RUNS) {
			compressResults.push(end - start);
		}
	}

	if(!basePercentResults[configName].compressed) {
		basePercentResults[configName].compressed = compressed.length;
	}
	rawTableResults[configName] += ' | ' + compressed.length.toLocaleString("en-US");
	console.log(`${name} ${configName} compressed: ${compressed.length.toLocaleString("en-US")} chars`);
	percentTableResults[configName] += ' | ' + (compressed.length / basePercentResults[configName].compressed * 100).toFixed(0) + '%';

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

	if(!basePercentResults[configName][type]) {
		basePercentResults[configName][type] = average;
	}
	let rawResultText = `${average.toFixed(fixedUnits)}${unit} (${min}${unit} - ${max}${unit} std dev ${standardDeviation.toFixed(fixedUnits)}${unit})`;
	rawTableResults[configName] += ' | ' + rawResultText;
	percentTableResults[configName] += ' | ' + (average / basePercentResults[configName][type] * 100).toFixed(0) + '%';
	console.log(`${name} ${configName} average ${type}: ${rawResultText}`);
}



export function printResultTables() {
	Object.keys(rawTableResults).forEach((configName) => {
		console.log('Raw results for ' + configName);
		console.log(rawTableResults[configName]);
		console.log('');

		console.log('Percent results for ' + configName + ' (lower is better)');
		console.log(percentTableResults[configName]);
		console.log('');
		console.log('');
	});
}
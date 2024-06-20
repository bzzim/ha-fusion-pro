import { readFile } from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { versionCompare } from '$lib/Utils';
import type { AppVersion } from '$lib/Types';

// load
export const GET: RequestHandler = async () => {
	const [installed, latest, url] = await loadVersions().catch((err) => error(500, err));

	return json({
		has_update: versionCompare(latest, installed),
		installed: installed,
		latest: latest,
		url: url
	} as AppVersion);
};

async function loadVersions(): Promise<[string, string, string]> {
	const packageFile = await readFile('./package.json', 'utf8').catch((err) => {
		console.log('readFile', err.message);
		return Promise.reject(false);
	});
	const packageData = JSON.parse(packageFile);

	const url = getGithubApiUrl(packageData.repository.url);
	const response = await fetch(url, {
		headers: { 'Content-Type': 'application/json' }
	});
	if (!response.ok) {
		console.log('load data from github', response.statusText);
		return Promise.reject(false);
	}
	const data = await response.json().catch((err: any) => {
		console.log('parse response data', err.message);
		return Promise.reject(false);
	});

	return [packageData.version, data?.tag_name, data?.html_url];
}

function getGithubApiUrl(urlString: string): string {
	const path = new URL(urlString).pathname.replace('.git', '');
	return `https://api.github.com/repos${path}/releases/latest`;
}

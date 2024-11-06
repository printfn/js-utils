export async function fromBase64(base64: string) {
	try {
		const response = await fetch('data:application/octet-stream;base64,' + base64);
		return new Uint8Array(await response.arrayBuffer());
	} catch {
		throw new Error('invalid base64 data');
	}
}

export async function toBase64(data: BufferSource) {
	const url = await new Promise<string>((resolve, reject) => {
		const reader = Object.assign(new FileReader(), {
			onload: () => {
				resolve(reader.result as string);
			},
			onerror: () => {
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
				reject(reader.error);
			},
		});
		reader.readAsDataURL(new File([data], '', {
			type: 'application/octet-stream'
		}));
	});
	const prefix = 'data:application/octet-stream;base64,';
	if (!url.startsWith(prefix)) {
		throw new Error(`invalid data URL: ${url}`);
	}
	return url.substring(prefix.length);
}

export function base64ToBase64Url(base64: string) {
	return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export function base64UrlToBase64(base64url: string) {
	if (!/^[a-zA-Z0-9\-_]*$/.test(base64url)) throw new Error('Expected a URL-safe Base64-encoded string');
	let result = base64url.replaceAll('-', '+').replaceAll('_', '/');
	while (result.length % 4 !== 0) {
		result += '=';
	}
	return result;
}

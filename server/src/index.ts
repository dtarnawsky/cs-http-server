export interface Env {
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.url.endsWith('favicon.ico')) {
			return new Response('');
		}
		let h = '';
		for (const header of request.headers.keys()) {
			h += `<tr><td>${header}</td><td>${request.headers.get(header)}</td></tr>`;
		}
		const contentType = request.headers.get('content-type');

		let txt = '';
		if (contentType?.startsWith('multipart/form-data')) {
			txt = await parseFormData(contentType, request);
		} else {
			txt = await parseBaseData(request);
		}


		// const text = await request.text();

		// console.log(text);
		return new Response(`
		<b>Form Data</b><br/>
		${txt}
		<b>Headers</b><br/>
		<table>${h}</table>

		`, {
			headers: {
				...corsHeaders(request.headers),
				"content-type": "text/html;charset=UTF-8",
			}
		});
	},
};

async function parseBaseData(request: Request): Promise<string> {

	const base64Data = await request.text();
	console.log('encoded', base64Data)
	const decodedData = atob(base64Data);
	console.log('decoded', JSON.stringify(decodedData));
	return decodedData;
}


async function parseFormData(contentType: string, request: Request): Promise<string> {
	const boundary = contentType!.split(';').find(part => part.trim().startsWith('boundary='))!.split('=')[1];

	const reader = request.body!.getReader();
	let buffer = '';

	const readChunk = async () => {
		const { done, value } = await reader.read();
		buffer += new TextDecoder().decode(value);
		if (!done) {
			await readChunk();
		}
	};

	await readChunk();

	const parts = buffer.split(`--${boundary}`);
	let txt = '';
	for (const part of parts.slice(1, -1)) {
		const [header, content] = part.split('\r\n\r\n');
		const fields = header.split('\r\n');
		const fieldName = fields!.find(field => field.startsWith('Content-Disposition: form-data; name='))!.split('=')[1].trim();

		txt += `${fieldName}=${content.trim()}<br/>`;
		console.log(`Field name: ${fieldName}`);
		console.log(`Field content: ${content.trim()}`); // Access content
	}
	return txt;
}

export function corsHeaders(headers: Headers): any {
	return {
		'Access-Control-Allow-Origin': "*",
		"Access-Control-Allow-Methods": "GET,HEAD,POST,DELETE,OPTIONS",
		"Access-Control-Allow-Headers": "*",
		"Access-Control-Expose-headers": "*",
		"Access-Control-Max-Age": "86400",
	};
}

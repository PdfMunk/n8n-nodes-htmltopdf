import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

const RESOURCES = {
	PDF_CREATION_CONVERSION: 'pdfCreationConversion',
	PDF_MANIPULATION: 'pdfManipulation',
	PDF_SECURITY: 'pdfSecurity',
	PDF_EXTRACTION_PARSING: 'pdfExtractionParsing',
} as const;

const OPERATIONS = {
	CONVERT_HTML_TO_PDF: 'htmlToPdf',
	CAPTURE_WEBSITE_SCREENSHOT_TO_PDF: 'urlToPdf',
	MERGE_PDF: 'mergePdf',
	SPLIT_PDF: 'splitPdf',
	COMPRESS_PDF: 'compressPdf',
	LOCK_PDF: 'lockPdf',
	UNLOCK_PDF: 'unlockPdf',
	PARSE_PDF_TO_JSON: 'parsePdfToJson',
} as const;

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function uint8ToBase64(bytes: Uint8Array): string {
	let output = '';
	for (let i = 0; i < bytes.length; i += 3) {
		const a = bytes[i] ?? 0;
		const b = bytes[i + 1] ?? 0;
		const c = bytes[i + 2] ?? 0;
		const triple = (a << 16) | (b << 8) | c;

		output += BASE64_ALPHABET[(triple >> 18) & 0x3f];
		output += BASE64_ALPHABET[(triple >> 12) & 0x3f];
		output += i + 1 < bytes.length ? BASE64_ALPHABET[(triple >> 6) & 0x3f] : '=';
		output += i + 2 < bytes.length ? BASE64_ALPHABET[triple & 0x3f] : '=';
	}
	return output;
}

function base64ToUint8(base64Input: string): Uint8Array {
	const base64 = base64Input.replace(/\s+/g, '');
	if (base64.length === 0) return new Uint8Array();

	const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
	const outputLength = (base64.length * 3) / 4 - padding;
	const out = new Uint8Array(outputLength);

	let outIndex = 0;
	for (let i = 0; i < base64.length; i += 4) {
		const c0 = base64[i];
		const c1 = base64[i + 1];
		const c2 = base64[i + 2];
		const c3 = base64[i + 3];

		const n0 = c0 === '=' ? 0 : BASE64_ALPHABET.indexOf(c0);
		const n1 = c1 === '=' ? 0 : BASE64_ALPHABET.indexOf(c1);
		const n2 = c2 === '=' ? 0 : BASE64_ALPHABET.indexOf(c2);
		const n3 = c3 === '=' ? 0 : BASE64_ALPHABET.indexOf(c3);
		if (n0 < 0 || n1 < 0 || n2 < 0 || n3 < 0) {
			throw new Error('Invalid base64 input');
		}

		const triple = (n0 << 18) | (n1 << 12) | (n2 << 6) | n3;
		if (outIndex < out.length) out[outIndex++] = (triple >> 16) & 0xff;
		if (outIndex < out.length) out[outIndex++] = (triple >> 8) & 0xff;
		if (outIndex < out.length) out[outIndex++] = triple & 0xff;
	}

	return out;
}

const PDF_INPUT_TYPES = {
	URL: 'url',
	BINARY: 'binary',
} as const;

const PDF_OUTPUT_TYPES = {
	URL: 'url',
	FILE: 'file',
	BASE64: 'base64',
} as const;

const MERGE_SOURCES = {
	INPUT_ITEMS_BINARY: 'itemsBinary',
	URLS: 'urls',
} as const;

const SPLIT_MODES = {
	PAGES: 'pages',
	EACH: 'each',
	CHUNKS: 'chunks',
} as const;

export class Htmlcsstopdf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML to PDF (Sandbox)',
		name: 'htmlcsstopdfSandbox',
		icon: { light: 'file:htmlcsstopdf.svg', dark: 'file:htmlcsstopdf.svg' },
		group: ['transform'],
		version: 1,
		description: 'Convert HTML to PDF or Capture Website Screenshots to PDF',
		defaults: {
			name: 'HTML to PDF (Sandbox)',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'htmlcsstopdfApiSandbox',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'PDF Creation & Conversion',
						value: RESOURCES.PDF_CREATION_CONVERSION,
					},
					{
						name: 'PDF Manipulation',
						value: RESOURCES.PDF_MANIPULATION,
					},
					{
						name: 'PDF Security',
						value: RESOURCES.PDF_SECURITY,
					},
					{
						name: 'PDF Extraction & Parsing',
						value: RESOURCES.PDF_EXTRACTION_PARSING,
					},
				],
				default: RESOURCES.PDF_CREATION_CONVERSION,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Convert HTML to PDF',
						value: OPERATIONS.CONVERT_HTML_TO_PDF,
						description: 'Convert HTML/CSS to PDF',
						action: 'Convert HTML to PDF',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_CREATION_CONVERSION],
							},
						},
					},
					{
						name: 'Capture Website Screenshot to PDF',
						value: OPERATIONS.CAPTURE_WEBSITE_SCREENSHOT_TO_PDF,
						description: 'Capture website screenshot to PDF',
						action: 'Capture website screenshot to PDF',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_CREATION_CONVERSION],
							},
						},
					},
					{
						name: 'Merge PDF',
						value: OPERATIONS.MERGE_PDF,
						description: 'Merge multiple PDFs into one',
						action: 'Merge PDF',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_MANIPULATION],
							},
						},
					},
					{
						name: 'Split PDF',
						value: OPERATIONS.SPLIT_PDF,
						description: 'Split a PDF into multiple documents',
						action: 'Split PDF',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_MANIPULATION],
							},
						},
					},
					{
						name: 'Compress PDF',
						value: OPERATIONS.COMPRESS_PDF,
						description: 'Compress a PDF to reduce file size',
						action: 'Compress PDF',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_MANIPULATION],
							},
						},
					},
					{
						name: 'Lock PDF',
						value: OPERATIONS.LOCK_PDF,
						description: 'Protect a PDF with a password',
						action: 'Lock PDF',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_SECURITY],
							},
						},
					},
					{
						name: 'Unlock PDF',
						value: OPERATIONS.UNLOCK_PDF,
						description: 'Remove password protection from a PDF',
						action: 'Unlock PDF',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_SECURITY],
							},
						},
					},
					{
						name: 'Parse PDF to JSON',
						value: OPERATIONS.PARSE_PDF_TO_JSON,
						description: 'Extract structured data from a PDF as JSON',
						action: 'Parse PDF to JSON',
						displayOptions: {
							show: {
								resource: [RESOURCES.PDF_EXTRACTION_PARSING],
							},
						},
					},
				],
				default: OPERATIONS.CONVERT_HTML_TO_PDF,
			},
			// Properties for HTML to Image
			{
				displayName: 'HTML Content',
				name: 'html_content',
				type: 'string',
				default: '',
				description: 'HTML content to render as an image',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [OPERATIONS.CONVERT_HTML_TO_PDF],
					},
				},
			},
			{
				displayName: 'CSS Content',
				name: 'css_content',
				type: 'string',
				default: '',
				description: 'CSS to style the HTML',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [OPERATIONS.CONVERT_HTML_TO_PDF],
					},
				},
			},
			{
				displayName: 'Viewport Width',
				name: 'viewPortWidth',
				type: 'number',
				default: 1080,
				description: 'Viewport Width in Pixels',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [
							OPERATIONS.CONVERT_HTML_TO_PDF,
							OPERATIONS.CAPTURE_WEBSITE_SCREENSHOT_TO_PDF,
						],
					},
				},
			},
			{
				displayName: 'Viewport Height',
				name: 'viewPortHeight',
				type: 'number',
				default: 720,
				description: 'Viewport Height in Pixels',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [
							OPERATIONS.CONVERT_HTML_TO_PDF,
							OPERATIONS.CAPTURE_WEBSITE_SCREENSHOT_TO_PDF,
						],
					},
				},
			},
			{
				displayName: 'Response Format',
				name: 'response_format_html',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'PNG', value: 'png' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'url',
				description: 'Format of the image response',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [OPERATIONS.CONVERT_HTML_TO_PDF],
					},
				},
			},
			// Properties for URL to Image
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The URL of the website to capture',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [OPERATIONS.CAPTURE_WEBSITE_SCREENSHOT_TO_PDF],
					},
				},
			},
			{
				displayName: 'Full Page',
				name: 'full_page',
				type: 'boolean',
				default: true,
				description: 'Whether to capture the full page',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [OPERATIONS.CAPTURE_WEBSITE_SCREENSHOT_TO_PDF],
					},
				},
			},
			{
				displayName: 'Wait Till',
				name: 'wait_till',
				type: 'number',
				default: 10000,
				description: 'Milliseconds to wait before capturing',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_CREATION_CONVERSION],
						operation: [OPERATIONS.CAPTURE_WEBSITE_SCREENSHOT_TO_PDF],
					},
				},
			},
			{
				displayName: 'Input Type',
				name: 'pdfInputType',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'URL', value: PDF_INPUT_TYPES.URL },
					{ name: 'Binary', value: PDF_INPUT_TYPES.BINARY },
				],
				default: PDF_INPUT_TYPES.URL,
				displayOptions: {
					show: {
						operation: [
							OPERATIONS.SPLIT_PDF,
							OPERATIONS.COMPRESS_PDF,
							OPERATIONS.LOCK_PDF,
							OPERATIONS.UNLOCK_PDF,
							OPERATIONS.PARSE_PDF_TO_JSON,
						],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'pdfUrl',
				type: 'string',
				default: '',
				description: 'Public URL to the input PDF',
				displayOptions: {
					show: {
						pdfInputType: [PDF_INPUT_TYPES.URL],
						operation: [
							OPERATIONS.SPLIT_PDF,
							OPERATIONS.COMPRESS_PDF,
							OPERATIONS.LOCK_PDF,
							OPERATIONS.UNLOCK_PDF,
							OPERATIONS.PARSE_PDF_TO_JSON,
						],
					},
				},
			},
			{
				displayName: 'Binary Property',
				name: 'pdfBinaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property that contains the PDF',
				displayOptions: {
					show: {
						pdfInputType: [PDF_INPUT_TYPES.BINARY],
						operation: [
							OPERATIONS.SPLIT_PDF,
							OPERATIONS.COMPRESS_PDF,
							OPERATIONS.LOCK_PDF,
							OPERATIONS.UNLOCK_PDF,
							OPERATIONS.PARSE_PDF_TO_JSON,
						],
					},
				},
			},
			{
				displayName: 'Output',
				name: 'pdfOutput',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'URL', value: PDF_OUTPUT_TYPES.URL },
					{ name: 'Binary File', value: PDF_OUTPUT_TYPES.FILE },
					{ name: 'Base64', value: PDF_OUTPUT_TYPES.BASE64 },
				],
				default: PDF_OUTPUT_TYPES.URL,
				description: 'How the API should return the output',
				displayOptions: {
					show: {
						operation: [
							OPERATIONS.MERGE_PDF,
							OPERATIONS.SPLIT_PDF,
							OPERATIONS.COMPRESS_PDF,
							OPERATIONS.LOCK_PDF,
							OPERATIONS.UNLOCK_PDF,
						],
					},
				},
			},
			{
				displayName: 'Output Binary Property',
				name: 'outputBinaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Binary property name to store the output file',
				displayOptions: {
					show: {
						pdfOutput: [PDF_OUTPUT_TYPES.FILE],
						operation: [
							OPERATIONS.MERGE_PDF,
							OPERATIONS.SPLIT_PDF,
							OPERATIONS.COMPRESS_PDF,
							OPERATIONS.LOCK_PDF,
							OPERATIONS.UNLOCK_PDF,
						],
					},
				},
			},
			{
				displayName: 'Output File Name',
				name: 'outputFileName',
				type: 'string',
				default: '',
				description: 'Optional output filename (e.g., output.pdf)',
				displayOptions: {
					show: {
						pdfOutput: [PDF_OUTPUT_TYPES.FILE],
						operation: [
							OPERATIONS.MERGE_PDF,
							OPERATIONS.SPLIT_PDF,
							OPERATIONS.COMPRESS_PDF,
							OPERATIONS.LOCK_PDF,
							OPERATIONS.UNLOCK_PDF,
						],
					},
				},
			},
			{
				displayName: 'Merge From',
				name: 'mergeFrom',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Input Items (Binary)', value: MERGE_SOURCES.INPUT_ITEMS_BINARY },
					{ name: 'URLs', value: MERGE_SOURCES.URLS },
				],
				default: MERGE_SOURCES.INPUT_ITEMS_BINARY,
				description: 'Where to read PDFs to merge from',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_MANIPULATION],
						operation: [OPERATIONS.MERGE_PDF],
					},
				},
			},
			{
				displayName: 'Binary Property',
				name: 'mergeBinaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Binary property on each input item that contains the PDF',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_MANIPULATION],
						operation: [OPERATIONS.MERGE_PDF],
						mergeFrom: [MERGE_SOURCES.INPUT_ITEMS_BINARY],
					},
				},
			},
			{
				displayName: 'PDF URLs',
				name: 'mergeUrls',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'urls',
						displayName: 'URLs',
						values: [
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
							},
						],
					},
				],
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_MANIPULATION],
						operation: [OPERATIONS.MERGE_PDF],
						mergeFrom: [MERGE_SOURCES.URLS],
					},
				},
			},
			{
				displayName: 'Split Mode',
				name: 'splitMode',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Extract Pages', value: SPLIT_MODES.PAGES },
					{ name: 'Split Each Page', value: SPLIT_MODES.EACH },
					{ name: 'Split Into Chunks', value: SPLIT_MODES.CHUNKS },
				],
				default: SPLIT_MODES.PAGES,
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_MANIPULATION],
						operation: [OPERATIONS.SPLIT_PDF],
					},
				},
			},
			{
				displayName: 'Pages',
				name: 'splitPages',
				type: 'string',
				default: '1-1',
				description: 'Page range, e.g. "1-3,5,7-"',
				displayOptions: {
					show: {
						splitMode: [SPLIT_MODES.PAGES],
						resource: [RESOURCES.PDF_MANIPULATION],
						operation: [OPERATIONS.SPLIT_PDF],
					},
				},
			},
			{
				displayName: 'Chunks',
				name: 'splitChunks',
				type: 'number',
				default: 2,
				typeOptions: {
					minValue: 2,
				},
				description: 'Number of output chunks to split into',
				displayOptions: {
					show: {
						splitMode: [SPLIT_MODES.CHUNKS],
						resource: [RESOURCES.PDF_MANIPULATION],
						operation: [OPERATIONS.SPLIT_PDF],
					},
				},
			},
			{
				displayName: 'Compression',
				name: 'compressionStrength',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
					{ name: 'Max', value: 'max' },
				],
				default: 'high',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_MANIPULATION],
						operation: [OPERATIONS.COMPRESS_PDF],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'pdfPassword',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_SECURITY],
						operation: [OPERATIONS.LOCK_PDF, OPERATIONS.UNLOCK_PDF],
					},
				},
			},
			{
				displayName: 'Input Password',
				name: 'pdfInputPassword',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'If the input PDF is already encrypted, provide its password',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_SECURITY],
						operation: [OPERATIONS.LOCK_PDF],
					},
				},
			},
			{
				displayName: 'Parse Mode',
				name: 'parseMode',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Full', value: 'full' },
					{ name: 'Text', value: 'text' },
					{ name: 'Layout', value: 'layout' },
					{ name: 'Tables', value: 'tables' },
				],
				default: 'full',
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_EXTRACTION_PARSING],
						operation: [OPERATIONS.PARSE_PDF_TO_JSON],
					},
				},
			},
			{
				displayName: 'Pages',
				name: 'parsePages',
				type: 'string',
				default: 'all',
				description: "Page selection: 'all', '1-3', or '2'",
				displayOptions: {
					show: {
						resource: [RESOURCES.PDF_EXTRACTION_PARSING],
						operation: [OPERATIONS.PARSE_PDF_TO_JSON],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const requestJson = async (url: string, body: Record<string, unknown>) =>
			await this.helpers.httpRequestWithAuthentication.call(this, 'htmlcsstopdfApiSandbox', {
				method: 'POST',
				url,
				body,
				json: true,
			});

		const requestMultipart = async (url: string, formData: Record<string, any>, expectBinary: boolean) =>
			await this.helpers.httpRequestWithAuthentication.call(this, 'htmlcsstopdfApiSandbox', {
				method: 'POST',
				url,
				// `formData` is supported by n8n request helpers but may be missing from typings
				formData,
				json: !expectBinary,
				encoding: expectBinary ? ('arraybuffer' as const) : undefined,
				returnFullResponse: expectBinary,
			} as any);

		const toBinaryItem = async (
			itemIndex: number,
			data: Uint8Array,
			binaryPropertyName: string,
			fileName: string,
			mimeType: string,
			json: IDataObject,
		): Promise<INodeExecutionData> => {
			const prepared = await this.helpers.prepareBinaryData(data as any, fileName, mimeType);
			return {
				json,
				binary: {
					[binaryPropertyName]: prepared,
				},
				pairedItem: { item: itemIndex },
			};
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: unknown;
				let handled = false;

				switch (operation) {
					case OPERATIONS.CONVERT_HTML_TO_PDF: {
						const body: Record<string, unknown> = {
							html_content: this.getNodeParameter('html_content', i) as string,
							css_content: this.getNodeParameter('css_content', i) as string,
							viewPortWidth: this.getNodeParameter('viewPortWidth', i) as number,
							viewPortHeight: this.getNodeParameter('viewPortHeight', i) as number,
							response_format: this.getNodeParameter('response_format_html', i) as string,
						};

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'htmlcsstopdfApiSandbox',
							{
								method: 'POST',
								url: 'https://pdfmunk.com/api/v1/generatePdf',
								body,
								json: true,
							},
						);
						break;
					}

					case OPERATIONS.CAPTURE_WEBSITE_SCREENSHOT_TO_PDF: {
						const body: Record<string, unknown> = {
							url: this.getNodeParameter('url', i) as string,
							full_page: this.getNodeParameter('full_page', i) as boolean,
							wait_till: this.getNodeParameter('wait_till', i) as number,
							viewPortWidth: this.getNodeParameter('viewPortWidth', i) as number,
							viewPortHeight: this.getNodeParameter('viewPortHeight', i) as number,
						};

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'htmlcsstopdfApiSandbox',
							{
								method: 'POST',
								url: 'https://pdfmunk.com/api/v1/generatePdf',
								body,
								json: true,
							},
						);
						break;
					}

					case OPERATIONS.MERGE_PDF: {
						const pdfOutput = this.getNodeParameter('pdfOutput', i) as string;
						const mergeFrom = this.getNodeParameter('mergeFrom', i) as string;
						const url = 'https://pdfmunk.com/api/v1/pdf/merge';

						if (mergeFrom === MERGE_SOURCES.INPUT_ITEMS_BINARY) {
							if (i > 0) {
								handled = true;
								break;
							}
							if (items.length < 2) {
								throw new NodeOperationError(
									this.getNode(),
									'Merge PDF requires at least 2 input items when merging from input items.',
									{ itemIndex: i },
								);
							}

							const binaryProperty = this.getNodeParameter('mergeBinaryPropertyName', 0) as string;
							const filesBase64: string[] = [];
							for (let idx = 0; idx < items.length; idx++) {
								const buffer = await this.helpers.getBinaryDataBuffer(idx, binaryProperty);
								filesBase64.push(uint8ToBase64(buffer as unknown as Uint8Array));
							}

							responseData = await requestJson(url, {
								files: filesBase64,
								output: pdfOutput,
							});
						} else {
							const mergeUrlsParam = this.getNodeParameter('mergeUrls', i) as {
								urls?: Array<{ url: string }>;
							};
							const urls = (mergeUrlsParam?.urls ?? [])
								.map((u) => u.url)
								.filter((u) => typeof u === 'string' && u.length > 0);
							if (urls.length < 2) {
								throw new NodeOperationError(this.getNode(), 'Merge PDF requires at least 2 URLs.', {
									itemIndex: i,
								});
							}
							responseData = await requestJson(url, { urls, output: pdfOutput });
						}

						// If user requested a binary file, best-effort convert base64 payload to binary.
						if (pdfOutput === PDF_OUTPUT_TYPES.FILE && responseData && typeof responseData === 'object') {
							const json = responseData as Record<string, any>;
							const binaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
							const requestedName = (this.getNodeParameter('outputFileName', i) as string) || 'merged.pdf';
							const base64 = json.merged_pdf_base64 as string | undefined;
							if (base64) {
								delete json.merged_pdf_base64;
								returnData.push(
									await toBinaryItem(i, base64ToUint8(base64), binaryPropertyName, requestedName, 'application/pdf', json),
								);
								handled = true;
							}
						}
						break;
					}

					case OPERATIONS.SPLIT_PDF: {
						const pdfInputType = this.getNodeParameter('pdfInputType', i) as string;
						const pdfOutput = this.getNodeParameter('pdfOutput', i) as string;
						const splitMode = this.getNodeParameter('splitMode', i) as string;
						const url = 'https://pdfmunk.com/api/v1/pdf/split';

						const body: Record<string, unknown> = {
							output: pdfOutput,
						};

						if (splitMode === SPLIT_MODES.PAGES) {
							body.pages = this.getNodeParameter('splitPages', i) as string;
						} else if (splitMode === SPLIT_MODES.EACH) {
							body.mode = 'each';
						} else if (splitMode === SPLIT_MODES.CHUNKS) {
							body.chunks = this.getNodeParameter('splitChunks', i) as number;
						}

						if (pdfInputType === PDF_INPUT_TYPES.URL) {
							body.url = this.getNodeParameter('pdfUrl', i) as string;
						} else {
							const binaryProperty = this.getNodeParameter('pdfBinaryPropertyName', i) as string;
							const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
							body.file = uint8ToBase64(buffer as unknown as Uint8Array);
						}

						responseData = await requestJson(url, body);

						if (pdfOutput === PDF_OUTPUT_TYPES.FILE && responseData && typeof responseData === 'object') {
							const json = responseData as Record<string, any>;
							const binaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
							const requestedName = (this.getNodeParameter('outputFileName', i) as string) || 'split.pdf';

							if (typeof json.split_pdf_base64 === 'string' && json.split_pdf_base64.length > 0) {
								const base64 = json.split_pdf_base64 as string;
								delete json.split_pdf_base64;
								returnData.push(
									await toBinaryItem(i, base64ToUint8(base64), binaryPropertyName, requestedName, 'application/pdf', json),
								);
								handled = true;
							} else if (typeof json.zip_base64 === 'string' && json.zip_base64.length > 0) {
								const base64 = json.zip_base64 as string;
								delete json.zip_base64;
								const zipName = requestedName.endsWith('.zip') ? requestedName : 'split.zip';
								returnData.push(
									await toBinaryItem(i, base64ToUint8(base64), binaryPropertyName, zipName, 'application/zip', json),
								);
								handled = true;
							}
						}

						break;
					}

					case OPERATIONS.COMPRESS_PDF: {
						const pdfInputType = this.getNodeParameter('pdfInputType', i) as string;
						const pdfOutput = this.getNodeParameter('pdfOutput', i) as string;
						const compression = this.getNodeParameter('compressionStrength', i) as string;
						const url = 'https://pdfmunk.com/api/v1/compressPdf';
						const outputName = this.getNodeParameter('outputFileName', i, '') as string;

						const expectBinary = pdfOutput === PDF_OUTPUT_TYPES.FILE;

						if (expectBinary || pdfInputType === PDF_INPUT_TYPES.BINARY) {
							const formData: Record<string, any> = {
								compression,
								output: pdfOutput,
							};
							if (outputName) formData.output_name = outputName;

							if (pdfInputType === PDF_INPUT_TYPES.URL) {
								formData.url = this.getNodeParameter('pdfUrl', i) as string;
							} else {
								const binaryProperty = this.getNodeParameter('pdfBinaryPropertyName', i) as string;
								const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
								formData.file = {
									value: buffer,
									options: { filename: 'input.pdf', contentType: 'application/pdf' },
								};
							}

							const resp = await requestMultipart(url, formData, expectBinary);
							if (expectBinary) {
								const binaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
								const fileName = outputName || 'compressed.pdf';
								const contentType =
									(resp?.headers?.['content-type'] as string) ||
									(resp?.headers?.['Content-Type'] as string) ||
									'application/pdf';
								const bodyArrayBuffer = resp.body as ArrayBuffer;
								const bytes = new Uint8Array(bodyArrayBuffer);
								returnData.push(
									await toBinaryItem(i, bytes, binaryPropertyName, fileName, contentType, { success: true }),
								);
								handled = true;
							} else {
								responseData = resp;
							}
						} else {
							responseData = await requestJson(url, {
								url: this.getNodeParameter('pdfUrl', i) as string,
								compression,
								output: pdfOutput,
								...(outputName ? { output_name: outputName } : {}),
							});
						}
						break;
					}

					case OPERATIONS.LOCK_PDF: {
						const pdfInputType = this.getNodeParameter('pdfInputType', i) as string;
						const pdfOutput = this.getNodeParameter('pdfOutput', i) as string;
						const password = this.getNodeParameter('pdfPassword', i) as string;
						const inputPassword = this.getNodeParameter('pdfInputPassword', i, '') as string;
						const outputName = this.getNodeParameter('outputFileName', i, '') as string;
						const url = 'https://pdfmunk.com/api/v1/lockPdf';
						const expectBinary = pdfOutput === PDF_OUTPUT_TYPES.FILE;

						if (expectBinary || pdfInputType === PDF_INPUT_TYPES.BINARY) {
							const formData: Record<string, any> = {
								password,
								output: pdfOutput,
							};
							if (inputPassword) formData.input_password = inputPassword;
							if (outputName) formData.output_name = outputName;

							if (pdfInputType === PDF_INPUT_TYPES.URL) {
								formData.url = this.getNodeParameter('pdfUrl', i) as string;
							} else {
								const binaryProperty = this.getNodeParameter('pdfBinaryPropertyName', i) as string;
								const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
								formData.file = {
									value: buffer,
									options: { filename: 'input.pdf', contentType: 'application/pdf' },
								};
							}

							const resp = await requestMultipart(url, formData, expectBinary);
							if (expectBinary) {
								const binaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
								const fileName = outputName || 'locked.pdf';
								const contentType =
									(resp?.headers?.['content-type'] as string) ||
									(resp?.headers?.['Content-Type'] as string) ||
									'application/pdf';
								returnData.push(
									await toBinaryItem(i, new Uint8Array(resp.body as ArrayBuffer), binaryPropertyName, fileName, contentType, { success: true }),
								);
								handled = true;
							} else {
								responseData = resp;
							}
						} else {
							responseData = await requestJson(url, {
								url: this.getNodeParameter('pdfUrl', i) as string,
								password,
								...(inputPassword ? { input_password: inputPassword } : {}),
								output: pdfOutput,
								...(outputName ? { output_name: outputName } : {}),
							});
						}
						break;
					}

					case OPERATIONS.UNLOCK_PDF: {
						const pdfInputType = this.getNodeParameter('pdfInputType', i) as string;
						const pdfOutput = this.getNodeParameter('pdfOutput', i) as string;
						const password = this.getNodeParameter('pdfPassword', i) as string;
						const outputName = this.getNodeParameter('outputFileName', i, '') as string;
						const url = 'https://pdfmunk.com/api/v1/unlockPdf';
						const expectBinary = pdfOutput === PDF_OUTPUT_TYPES.FILE;

						if (expectBinary || pdfInputType === PDF_INPUT_TYPES.BINARY) {
							const formData: Record<string, any> = {
								password,
								output: pdfOutput,
							};
							if (outputName) formData.output_name = outputName;

							if (pdfInputType === PDF_INPUT_TYPES.URL) {
								formData.url = this.getNodeParameter('pdfUrl', i) as string;
							} else {
								const binaryProperty = this.getNodeParameter('pdfBinaryPropertyName', i) as string;
								const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
								formData.file = {
									value: buffer,
									options: { filename: 'input.pdf', contentType: 'application/pdf' },
								};
							}

							const resp = await requestMultipart(url, formData, expectBinary);
							if (expectBinary) {
								const binaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
								const fileName = outputName || 'unlocked.pdf';
								const contentType =
									(resp?.headers?.['content-type'] as string) ||
									(resp?.headers?.['Content-Type'] as string) ||
									'application/pdf';
								returnData.push(
									await toBinaryItem(i, new Uint8Array(resp.body as ArrayBuffer), binaryPropertyName, fileName, contentType, { success: true }),
								);
								handled = true;
							} else {
								responseData = resp;
							}
						} else {
							responseData = await requestJson(url, {
								url: this.getNodeParameter('pdfUrl', i) as string,
								password,
								output: pdfOutput,
								...(outputName ? { output_name: outputName } : {}),
							});
						}
						break;
					}

					case OPERATIONS.PARSE_PDF_TO_JSON: {
						const pdfInputType = this.getNodeParameter('pdfInputType', i) as string;
						const mode = this.getNodeParameter('parseMode', i) as string;
						const pages = this.getNodeParameter('parsePages', i) as string;
						const url = 'https://pdfmunk.com/api/v1/pdf/parse';

						if (pdfInputType === PDF_INPUT_TYPES.URL) {
							responseData = await requestJson(url, {
								url: this.getNodeParameter('pdfUrl', i) as string,
								mode,
								pages,
							});
						} else {
							const binaryProperty = this.getNodeParameter('pdfBinaryPropertyName', i) as string;
							const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
							responseData = await requestMultipart(
								url,
								{
									file: { value: buffer, options: { filename: 'input.pdf', contentType: 'application/pdf' } },
									mode,
									pages,
								},
								false,
							);
						}
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
				}

				if (!handled) {
					returnData.push({ json: responseData as any, pairedItem: { item: i } });
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}
		return [returnData];
	}
}

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Htmlcsstopdf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML to PDF',
		name: 'htmlcsstopdf',
		icon: { light: 'file:htmlcsstopdf.light.svg', dark: 'file:htmlcsstopdf.dark.svg' },
		group: ['transform'],
		version: 1,
		description: 'Convert HTML to PDF, Parse PDF, Extract Data, and Manage PDF Security',
		defaults: {
			name: 'HTML to PDF',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'htmlcsstopdfApi',
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
						name: 'PDF Creation',
						value: 'pdfCreation',
						description: 'Create PDF documents from various sources',
					},
					{
						name: 'PDF Manipulation',
						value: 'pdfManipulation',
						description: 'Merge, split, or compress PDF documents',
					},
					{
						name: 'PDF Security',
						value: 'pdfSecurity',
						description: 'Lock and unlock password-protected PDFs',
					},
					{
						name: 'PDF Extraction & Parsing',
						value: 'pdfParsing',
						description: 'Parse PDFs into structured JSON data',
					},
				],
				default: 'pdfCreation',
			},
			// PDF Creation Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['pdfCreation'],
					},
				},
				options: [
					{
						name: 'HTML to PDF',
						value: 'htmlToPdf',
						description: 'Generate PDF from HTML/CSS',
						action: 'Convert HTML to PDF',
					},
					{
						name: 'URL to PDF',
						value: 'urlToPdf',
						description: 'Capture Website Screenshot to PDF',
						action: 'Capture a screenshot of a website in PDF format',
					},
				],
				default: 'htmlToPdf',
			},
			// PDF Manipulation Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['pdfManipulation'],
					},
				},
				options: [
					{
						name: 'Merge PDFs',
						value: 'mergePdfs',
						description: 'Merge multiple PDF files into one',
						action: 'Merge multiple PDFS into one',
					},
					{
						name: 'Split PDF',
						value: 'splitPdf',
						description: 'Split or extract pages from a PDF',
						action: 'Split PDF',
					},
					{
						name: 'Compress PDF',
						value: 'compressPdf',
						description: 'Compress a PDF to reduce file size',
						action: 'Compress PDF',
					},
				],
				default: 'mergePdfs',
			},
			// PDF Security Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['pdfSecurity'],
					},
				},
				options: [
					{
						name: 'Lock PDF',
						value: 'lockPdf',
						description: 'Add password protection to a PDF',
						action: 'Lock PDF with password',
					},
					{
						name: 'Unlock PDF',
						value: 'unlockPdf',
						description: 'Remove password protection from a PDF',
						action: 'Unlock password protected PDF',
					},
				],
				default: 'lockPdf',
			},
			// PDF Parsing Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['pdfParsing'],
					},
				},
				options: [
					{
						name: 'Parse PDF',
						value: 'parsePdf',
						description: 'Extract structured data from PDF',
						action: 'Parse PDF to JSON',
					},
				],
				default: 'parsePdf',
			},
			// Properties for HTML to PDF
			{
				displayName: 'HTML Content',
				name: 'html_content',
				type: 'string',
				default: '',
				description: 'HTML content to render in the document',
				displayOptions: {
					show: {
						operation: ['htmlToPdf'],
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
						operation: ['htmlToPdf'],
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
						operation: ['htmlToPdf', 'urlToPdf'],
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
						operation: ['htmlToPdf', 'urlToPdf'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'output_format',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Format of the output response',
				displayOptions: {
					show: {
						operation: ['htmlToPdf', 'urlToPdf'],
					},
				},
			},
			// Properties for URL to PDF
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The URL of the website to capture',
				displayOptions: {
					show: {
						operation: ['urlToPdf'],
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
						operation: ['urlToPdf'],
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
						operation: ['urlToPdf'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'output_filename',
				type: 'string',
				default: 'document',
				description: 'The filename for the generated PDF (without .pdf extension)',
				displayOptions: {
					show: {
						operation: ['htmlToPdf', 'urlToPdf'],
					},
				},
			},
			{
				displayName: 'Timeout (in Seconds)',
				name: 'timeout',
				type: 'number',
				default: 300,
				description: 'Request timeout in seconds (default: 300 seconds = 5 minutes). Increase this for large PDFs.',
				displayOptions: {
					show: {
						operation: ['htmlToPdf', 'urlToPdf'],
					},
				},
			},
			{
				displayName: 'Dynamic Params',
				name: 'dynamic_params',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Dynamic parameters for templating (key/value pairs)',
				displayOptions: {
					show: {
						operation: ['htmlToPdf'],
					},
				},
				options: [
					{
						name: 'params',
						displayName: 'Params',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Placeholder key, for example {cert}',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Replacement value, for example name',
							},
						],
					},
				],
			},
			// Properties for Merge PDFs
			{
				displayName: 'PDF URLs',
				name: 'pdf_urls',
				type: 'string',
				default: '',
				description: 'Comma-separated list of PDF URLs to merge (minimum 2, maximum 15)',
				displayOptions: {
					show: {
						operation: ['mergePdfs'],
					},
				},
			},
			{
				displayName: 'Output Type',
				name: 'merge_output',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'url',
				description: 'Format of the merged PDF output',
				displayOptions: {
					show: {
						operation: ['mergePdfs'],
					},
				},
			},
			// Properties for Split PDF
			{
				displayName: 'PDF URL',
				name: 'split_url',
				type: 'string',
				default: '',
				description: 'URL of the PDF to split',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
					},
				},
			},
			{
				displayName: 'Split Mode',
				name: 'split_mode',
				type: 'options',
				options: [
					{ name: 'Extract Pages', value: 'pages' },
					{ name: 'Split Each Page', value: 'each' },
					{ name: 'Split Into Chunks', value: 'chunks' },
				],
				default: 'pages',
				description: 'How to split the PDF',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
					},
				},
			},
			{
				displayName: 'Page Range',
				name: 'pages',
				type: 'string',
				default: '1-5',
				description: 'Page range (e.g., "1-5", "1,3,5", "10-")',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
						split_mode: ['pages'],
					},
				},
			},
			{
				displayName: 'Number of Chunks',
				name: 'chunks',
				type: 'number',
				default: 2,
				description: 'Number of chunks to split the PDF into',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
						split_mode: ['chunks'],
					},
				},
			},
			{
				displayName: 'Output Type',
				name: 'split_output',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'url',
				description: 'Format of the split PDF output',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
					},
				},
			},
			// Properties for Compress PDF
			{
				displayName: 'PDF URL',
				name: 'compress_url',
				type: 'string',
				default: '',
				description: 'URL of the PDF to compress (max 10MB)',
				displayOptions: {
					show: {
						operation: ['compressPdf'],
					},
				},
			},
			{
				displayName: 'Compression Level',
				name: 'compression',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
					{ name: 'Max', value: 'max' },
				],
				default: 'high',
				description: 'Compression strength (higher is more aggressive)',
				displayOptions: {
					show: {
						operation: ['compressPdf'],
					},
				},
			},
			{
				displayName: 'Output Type',
				name: 'compress_output',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'file',
				description: 'Format of the compressed PDF output',
				displayOptions: {
					show: {
						operation: ['compressPdf'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'compress_output_name',
				type: 'string',
				default: 'compressed.pdf',
				description: 'Custom name for the output file',
				displayOptions: {
					show: {
						operation: ['compressPdf'],
					},
				},
			},
			// Properties for Lock PDF
			{
				displayName: 'PDF URL',
				name: 'lock_url',
				type: 'string',
				default: '',
				description: 'URL of the PDF to lock (max 10MB)',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'lock_password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Password to set on the PDF',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
					},
				},
			},
			{
				displayName: 'Input Password',
				name: 'lock_input_password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Optional password if the input PDF is already encrypted',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
					},
				},
			},
			{
				displayName: 'Output Type',
				name: 'lock_output',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'file',
				description: 'Format of the locked PDF output',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'lock_output_name',
				type: 'string',
				default: 'locked.pdf',
				description: 'Custom name for the output file',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
					},
				},
			},
			// Properties for Unlock PDF
			{
				displayName: 'PDF URL',
				name: 'unlock_url',
				type: 'string',
				default: '',
				description: 'URL of the password-protected PDF to unlock (max 10MB)',
				displayOptions: {
					show: {
						operation: ['unlockPdf'],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'unlock_password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Password to unlock the PDF',
				displayOptions: {
					show: {
						operation: ['unlockPdf'],
					},
				},
			},
			{
				displayName: 'Output Type',
				name: 'unlock_output',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'file',
				description: 'Format of the unlocked PDF output',
				displayOptions: {
					show: {
						operation: ['unlockPdf'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'unlock_output_name',
				type: 'string',
				default: 'unlocked.pdf',
				description: 'Custom name for the output file',
				displayOptions: {
					show: {
						operation: ['unlockPdf'],
					},
				},
			},
			// Properties for Parse PDF
			{
				displayName: 'PDF URL',
				name: 'parse_url',
				type: 'string',
				default: '',
				description: 'URL of the PDF to parse',
				displayOptions: {
					show: {
						operation: ['parsePdf'],
					},
				},
			},
			{
				displayName: 'Parse Mode',
				name: 'parse_mode',
				type: 'options',
				options: [
					{ name: 'Text Only', value: 'text', description: 'Extract text only' },
					{ name: 'Layout', value: 'layout', description: 'Text + text blocks with bounding boxes' },
					{ name: 'Tables', value: 'tables', description: 'Text + table blocks' },
					{ name: 'Full', value: 'full', description: 'Text + blocks + tables + images' },
				],
				default: 'full',
				description: 'What to extract from the PDF',
				displayOptions: {
					show: {
						operation: ['parsePdf'],
					},
				},
			},
			{
				displayName: 'Pages',
				name: 'parse_pages',
				type: 'string',
				default: 'all',
				description: 'Page selection: "all" or a range like "1-3" or single page like "2"',
				displayOptions: {
					show: {
						operation: ['parsePdf'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const toJsonObject = (body: unknown): IDataObject => {
			if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
				return body as IDataObject;
			}
			return { body: body as unknown as IDataObject };
		};

		const parseArrayBufferBody = (body: unknown): IDataObject => {
			try {
				if (!(body instanceof ArrayBuffer)) {
					return toJsonObject(body);
				}
				const text = Buffer.from(body).toString('utf8').trim();
				if (text === '') return {};
				try {
					return toJsonObject(JSON.parse(text));
				} catch {
					return { error: text };
				}
			} catch {
				return { error: 'Unable to parse error response' };
			}
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'pdfCreation') {
					// Handle PDF Creation operations
					const outputFormat = this.getNodeParameter('output_format', i) as string;
					const outputFilename = this.getNodeParameter('output_filename', i) as string;
					const timeoutSeconds = this.getNodeParameter('timeout', i) as number;
					const timeout = timeoutSeconds * 1000;
					const body: Record<string, unknown> = { output_filename: outputFilename };

					if (operation === 'htmlToPdf') {
						body.html_content = this.getNodeParameter('html_content', i) as string;
						body.css_content = this.getNodeParameter('css_content', i) as string;
						body.viewPortWidth = this.getNodeParameter('viewPortWidth', i) as number;
						body.viewPortHeight = this.getNodeParameter('viewPortHeight', i) as number;
						body.output_format = outputFormat;

						const dynamicParams = this.getNodeParameter('dynamic_params', i, {}) as {
							params?: Array<{ key?: string; value?: string }>;
						};

						if (dynamicParams.params?.length) {
							const mapped = dynamicParams.params
								.filter((p) => (p.key ?? '') !== '')
								.map((p) => ({ [p.key as string]: p.value ?? '' }));

							if (mapped.length) {
								body.dynamic_params = mapped;
							}
						}
					} else if (operation === 'urlToPdf') {
						body.url = this.getNodeParameter('url', i) as string;
						body.full_page = this.getNodeParameter('full_page', i) as boolean;
						body.wait_till = this.getNodeParameter('wait_till', i) as number;
						body.viewPortWidth = this.getNodeParameter('viewPortWidth', i) as number;
						body.viewPortHeight = this.getNodeParameter('viewPortHeight', i) as number;
						body.output_format = outputFormat;
					}

					if (outputFormat === 'file') {
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'htmlcsstopdfApi',
							{
								method: 'POST',
								url: 'https://pdfmunk.com/api/v1/generatePdf',
								body,
								json: true,
								encoding: 'arraybuffer',
								returnFullResponse: true,
								timeout,
							},
						);

						const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
						if (statusCode >= 400) {
							const errorBody = parseArrayBufferBody((responseData as { body?: unknown }).body);
							returnData.push({
								json: { ...errorBody, statusCode },
								pairedItem: { item: i },
							});
							continue;
						}

						const binaryData = await this.helpers.prepareBinaryData(
							Buffer.from(responseData.body as ArrayBuffer),
							`${outputFilename}.pdf`,
							'application/pdf',
						);

						returnData.push({
							json: { success: true },
							binary: { data: binaryData },
							pairedItem: { item: i },
						});
					} else {
						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'htmlcsstopdfApi',
							{
								method: 'POST',
								url: 'https://pdfmunk.com/api/v1/generatePdf',
								body,
								json: true,
								returnFullResponse: true,
								timeout,
							},
						);
						const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
						const bodyData = toJsonObject((responseData as { body?: unknown }).body);
						returnData.push({
							json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'pdfManipulation') {
					// Handle PDF Manipulation operations
					if (operation === 'mergePdfs') {
						const pdfUrlsString = this.getNodeParameter('pdf_urls', i) as string;
						const urls = pdfUrlsString.split(',').map((url) => url.trim()).filter((url) => url);
						const outputType = this.getNodeParameter('merge_output', i) as string;

						if (urls.length < 2) {
							throw new NodeOperationError(
								this.getNode(),
								'At least 2 PDF URLs are required for merging',
								{ itemIndex: i },
							);
						}

						if (urls.length > 15) {
							throw new NodeOperationError(
								this.getNode(),
								'Maximum 15 PDF URLs allowed for merging',
								{ itemIndex: i },
							);
						}

						const body = {
							urls,
							output: outputType,
						};

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/pdf/merge',
									body,
									json: true,
									encoding: 'arraybuffer',
									returnFullResponse: true,
								},
							);

							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							if (statusCode >= 400) {
								const errorBody = parseArrayBufferBody((responseData as { body?: unknown }).body);
								returnData.push({
									json: { ...errorBody, statusCode },
									pairedItem: { item: i },
								});
								continue;
							}

							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(responseData.body as ArrayBuffer),
								'merged.pdf',
								'application/pdf',
							);

							returnData.push({
								json: { success: true },
								binary: { data: binaryData },
								pairedItem: { item: i },
							});
						} else {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/pdf/merge',
									body,
									json: true,
									returnFullResponse: true,
								},
							);
							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							const bodyData = toJsonObject((responseData as { body?: unknown }).body);
							returnData.push({
								json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'splitPdf') {
						const pdfUrl = this.getNodeParameter('split_url', i) as string;
						const splitMode = this.getNodeParameter('split_mode', i) as string;
						const outputType = this.getNodeParameter('split_output', i) as string;

						const body: Record<string, unknown> = {
							url: pdfUrl,
							output: outputType,
						};

						if (splitMode === 'pages') {
							body.pages = this.getNodeParameter('pages', i) as string;
						} else if (splitMode === 'each') {
							body.mode = 'each';
						} else if (splitMode === 'chunks') {
							body.chunks = this.getNodeParameter('chunks', i) as number;
						}

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/pdf/split',
									body,
									json: true,
									encoding: 'arraybuffer',
									returnFullResponse: true,
								},
							);

							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							if (statusCode >= 400) {
								const errorBody = parseArrayBufferBody((responseData as { body?: unknown }).body);
								returnData.push({
									json: { ...errorBody, statusCode },
									pairedItem: { item: i },
								});
								continue;
							}

							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(responseData.body as ArrayBuffer),
								'split.pdf',
								'application/pdf',
							);

							returnData.push({
								json: { success: true },
								binary: { data: binaryData },
								pairedItem: { item: i },
							});
						} else {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/pdf/split',
									body,
									json: true,
									returnFullResponse: true,
								},
							);
							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							const bodyData = toJsonObject((responseData as { body?: unknown }).body);
							returnData.push({
								json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'compressPdf') {
						const pdfUrl = this.getNodeParameter('compress_url', i) as string;
						const compression = this.getNodeParameter('compression', i) as string;
						const outputType = this.getNodeParameter('compress_output', i) as string;
						const outputName = this.getNodeParameter('compress_output_name', i) as string;

						const body = {
							url: pdfUrl,
							compression,
							output: outputType,
							output_name: outputName,
						};

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/compressPdf',
									body,
									json: true,
									encoding: 'arraybuffer',
									returnFullResponse: true,
								},
							);

							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							if (statusCode >= 400) {
								const errorBody = parseArrayBufferBody((responseData as { body?: unknown }).body);
								returnData.push({
									json: { ...errorBody, statusCode },
									pairedItem: { item: i },
								});
								continue;
							}

							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(responseData.body as ArrayBuffer),
								outputName,
								'application/pdf',
							);

							returnData.push({
								json: { success: true },
								binary: { data: binaryData },
								pairedItem: { item: i },
							});
						} else {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/compressPdf',
									body,
									json: true,
									returnFullResponse: true,
								},
							);
							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							const bodyData = toJsonObject((responseData as { body?: unknown }).body);
							returnData.push({
								json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
								pairedItem: { item: i },
							});
						}
					}
				} else if (resource === 'pdfSecurity') {
					// Handle PDF Security operations
					if (operation === 'lockPdf') {
						const pdfUrl = this.getNodeParameter('lock_url', i) as string;
						const password = this.getNodeParameter('lock_password', i) as string;
						const inputPassword = this.getNodeParameter('lock_input_password', i, '') as string;
						const outputType = this.getNodeParameter('lock_output', i) as string;
						const outputName = this.getNodeParameter('lock_output_name', i) as string;

						const body: Record<string, unknown> = {
							url: pdfUrl,
							password,
							output: outputType,
							output_name: outputName,
						};

						if (inputPassword) {
							body.input_password = inputPassword;
						}

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/lockPdf',
									body,
									json: true,
									encoding: 'arraybuffer',
									returnFullResponse: true,
								},
							);

							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							if (statusCode >= 400) {
								const errorBody = parseArrayBufferBody((responseData as { body?: unknown }).body);
								returnData.push({
									json: { ...errorBody, statusCode },
									pairedItem: { item: i },
								});
								continue;
							}

							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(responseData.body as ArrayBuffer),
								outputName,
								'application/pdf',
							);

							returnData.push({
								json: { success: true },
								binary: { data: binaryData },
								pairedItem: { item: i },
							});
						} else {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/lockPdf',
									body,
									json: true,
									returnFullResponse: true,
								},
							);
							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							const bodyData = toJsonObject((responseData as { body?: unknown }).body);
							returnData.push({
								json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'unlockPdf') {
						const pdfUrl = this.getNodeParameter('unlock_url', i) as string;
						const password = this.getNodeParameter('unlock_password', i) as string;
						const outputType = this.getNodeParameter('unlock_output', i) as string;
						const outputName = this.getNodeParameter('unlock_output_name', i) as string;

						const body = {
							url: pdfUrl,
							password,
							output: outputType,
							output_name: outputName,
						};

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/unlockPdf',
									body,
									json: true,
									encoding: 'arraybuffer',
									returnFullResponse: true,
								},
							);

							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							if (statusCode >= 400) {
								const errorBody = parseArrayBufferBody((responseData as { body?: unknown }).body);
								returnData.push({
									json: { ...errorBody, statusCode },
									pairedItem: { item: i },
								});
								continue;
							}

							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(responseData.body as ArrayBuffer),
								outputName,
								'application/pdf',
							);

							returnData.push({
								json: { success: true },
								binary: { data: binaryData },
								pairedItem: { item: i },
							});
						} else {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/unlockPdf',
									body,
									json: true,
									returnFullResponse: true,
								},
							);
							const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
							const bodyData = toJsonObject((responseData as { body?: unknown }).body);
							returnData.push({
								json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
								pairedItem: { item: i },
							});
						}
					}
				} else if (resource === 'pdfParsing') {
					// Handle PDF Parsing operations
					if (operation === 'parsePdf') {
						const pdfUrl = this.getNodeParameter('parse_url', i) as string;
						const mode = this.getNodeParameter('parse_mode', i) as string;
						const pages = this.getNodeParameter('parse_pages', i) as string;

						const body = {
							url: pdfUrl,
							mode,
							pages,
						};

						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'htmlcsstopdfApi',
							{
								method: 'POST',
								url: 'https://pdfmunk.com/api/v1/pdf/parse',
								body,
								json: true,
								returnFullResponse: true,
							},
						);
						const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
						const bodyData = toJsonObject((responseData as { body?: unknown }).body);
						returnData.push({
							json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
							pairedItem: { item: i },
						});
					}
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

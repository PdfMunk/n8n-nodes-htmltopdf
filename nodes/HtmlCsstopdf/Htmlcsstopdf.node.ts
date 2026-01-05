import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class Htmlcsstopdf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML to PDF',
		name: 'htmlcsstopdf',
		icon: { light: 'file:htmlcsstopdf.svg', dark: 'file:htmlcsstopdf.svg' },
		group: ['transform'],
		version: 1,
		description: 'Convert HTML to PDF or Capture Website Screenshots to PDF',
		defaults: {
			name: 'HTML to PDF',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
						action: 'Capture website to PDF',
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
						action: 'Merge multiple PDFs',
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

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
					let body: Record<string, unknown> = { output_filename: outputFilename };

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
								timeout,
							},
						);
						returnData.push({ json: responseData, pairedItem: { item: i } });
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
								},
							);
							returnData.push({ json: responseData, pairedItem: { item: i } });
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
								},
							);
							returnData.push({ json: responseData, pairedItem: { item: i } });
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
								},
							);
							returnData.push({ json: responseData, pairedItem: { item: i } });
						}
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
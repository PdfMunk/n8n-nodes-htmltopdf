import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Htmlcsstopdf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML to Pdf',
		name: 'htmlcsstopdf',
		icon: { light: 'file:htmlcsstopdf.svg', dark: 'file:htmlcsstopdf.svg' },
		group: ['transform'],
		version: 1,
		description: 'Convert HTML or a URL to an pdf(new)',
		defaults: {
			name: 'HTML to Pdf',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'htmlcsstopdfApi',
				required: true,
			},
		],
		usableAsTool: true, // ADD THIS LINE
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'HTML to Pdf',
						value: 'htmlToPdf',
						description: 'Convert HTML and CSS to a pdf',
						action: 'Convert HTML and CSS to an pdf',
					},
					{
						name: 'URL to Pdf',
						value: 'urlToPdf',
						description: 'Capture a screenshot of a website into pdf',
						action: 'Capture a screenshot of a website into pdf',
					},
				],
				default: 'htmlToPdf',
			},
			// Properties for HTML to Image
			{
				displayName: 'HTML Content',
				name: 'html_content',
				type: 'string',
				default: '',
				description: 'The HTML content to render as an image',
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
				description: 'The CSS to style the HTML',
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
						operation: ['htmlToPdf'],
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let body: Record<string, unknown> = {};
				let response_format: string;

				if (operation === 'htmlToPdf') {
					body.html_content = this.getNodeParameter('html_content', i) as string;
					body.css_content = this.getNodeParameter('css_content', i) as string;
					body.viewPortWidth = this.getNodeParameter('viewPortWidth', i) as number;
					body.viewPortHeight = this.getNodeParameter('viewPortHeight', i) as number;
					response_format = this.getNodeParameter('response_format_html', i) as string;
					body.response_format = response_format;
				} else if (operation === 'urlToPdf') {
					body.url = this.getNodeParameter('url', i) as string;
					body.full_page = this.getNodeParameter('full_page', i) as boolean;
					body.wait_till = this.getNodeParameter('wait_till', i) as number;
					body.viewPortWidth = this.getNodeParameter('viewPortWidth', i) as number;
					body.viewPortHeight = this.getNodeParameter('viewPortHeight', i) as number;
				}

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'htmlcsstopdfApi',
					{
						method: 'POST',
						url: 'https://pdfmunk.com/api/v1/generatePdf',
						body,
						json: true,
					},
				);
				returnData.push({ json: responseData, pairedItem: i });

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: i });
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}
		return [returnData];
	}
}

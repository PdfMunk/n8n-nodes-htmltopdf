import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HtmlcsstopdfSandboxApi implements ICredentialType {
	name = 'htmlcsstopdfSandboxApi';
	displayName = 'HTML to PDF (Sandbox) API';
	documentationUrl = 'https://www.pdfmunk.com/api-docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'CLIENT-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://pdfmunk.com',
			url: '/api/v1/generatePdf',
			method: 'POST',
			headers: {
				'CLIENT-API-KEY': '={{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
			body: {
				html_content: '<div></div>',
				css_content: '',
				response_format: 'url',
			},
		},
	};
} 
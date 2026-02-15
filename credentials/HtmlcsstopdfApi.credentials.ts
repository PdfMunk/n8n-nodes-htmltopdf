import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HtmlcsstopdfApi implements ICredentialType {
	name = 'htmlcsstopdfApi';
	icon: Icon = {
		light: 'file:htmlcsstopdf.light.svg',
		dark: 'file:htmlcsstopdf.dark.svg'
	};
	displayName = 'HTML to PDF API';
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
			url: '/api/v1/validate-api-key',
			method: 'GET',
			headers: {
				'CLIENT-API-KEY': '={{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			}
		},
	};
} 
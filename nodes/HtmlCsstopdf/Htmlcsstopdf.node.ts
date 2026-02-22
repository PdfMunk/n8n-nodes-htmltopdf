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
						name: 'Compress PDF',
						value: 'compressPdf',
						description: 'Compress a PDF to reduce file size',
						action: 'Compress PDF',
					},
					{
						name: 'Convert Image to PDF',
						value: 'convertImageToPdf',
						description: 'Convert one or more images into a PDF',
						action: 'Convert image to PDF',
					},
					{
						name: 'Convert PDF to Image',
						value: 'convertPdfToImage',
						description: 'Convert PDF pages into image files',
						action: 'Convert PDF to image',
					},
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
						name: 'Watermark PDF',
						value: 'watermarkPdf',
						description: 'Add a text watermark to a PDF',
						action: 'Watermark PDF',
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
						description: 'Extract structured data from text-based PDF',
						action: 'Parse PDF to JSON',
					},
					{
						name: 'Parse PDF with OCR',
						value: 'parsePdfOcr',
						description: 'Extract text using ocr from scanned pdf pages',
						action: 'Parse PDF with OCR',
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
				displayName: 'Input Type',
				name: 'merge_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to merge by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['mergePdfs'],
					},
				},
			},
			{
				displayName: 'PDF URLs',
				name: 'pdf_urls',
				type: 'string',
				default: '',
				description: 'Comma-separated list of PDF URLs to merge (minimum 2, maximum 15)',
				displayOptions: {
					show: {
						operation: ['mergePdfs'],
						merge_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Properties',
				name: 'merge_file_binary_properties',
				type: 'string',
				default: 'data',
				description: 'Comma-separated binary property names to merge (minimum 2), for example data1,data2',
				displayOptions: {
					show: {
						operation: ['mergePdfs'],
						merge_input_type: ['file'],
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
				displayName: 'Input Type',
				name: 'split_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to split by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'split_url',
				type: 'string',
				default: '',
				description: 'URL of the PDF to split',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
						split_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Property',
				name: 'split_file_binary_property',
				type: 'string',
				default: 'data',
				description: 'Binary property containing the PDF file',
				displayOptions: {
					show: {
						operation: ['splitPdf'],
						split_input_type: ['file'],
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
				displayName: 'Input Type',
				name: 'compress_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to compress by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['compressPdf'],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'compress_url',
				type: 'string',
				default: '',
				description: 'URL of the PDF to compress (max 10MB)',
				displayOptions: {
					show: {
						operation: ['compressPdf'],
						compress_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Property',
				name: 'compress_file_binary_property',
				type: 'string',
				default: 'data',
				description: 'Binary property containing the PDF file',
				displayOptions: {
					show: {
						operation: ['compressPdf'],
						compress_input_type: ['file'],
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
			// Properties for Watermark PDF
			{
				displayName: 'Input Type',
				name: 'watermark_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to watermark by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'watermark_file_url',
				type: 'string',
				default: '',
				description: 'Public URL of the PDF to watermark',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
						watermark_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Property',
				name: 'watermark_file_binary_property',
				type: 'string',
				default: 'data',
				description: 'Binary property containing the PDF file',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
						watermark_input_type: ['file'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'watermark_output_format',
				type: 'options',
				options: [
					{ name: 'File', value: 'file' },
					{ name: 'URL', value: 'url' },
					{ name: 'Base64', value: 'base64' },
					{ name: 'Both', value: 'both' },
				],
				default: 'file',
				description: 'Format of the watermarked output',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
					},
				},
			},
			{
				displayName: 'Watermark Text',
				name: 'watermark_text',
				type: 'string',
				default: 'CONFIDENTIAL',
				description: 'Watermark text to apply',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
					},
				},
			},
			{
				displayName: 'Opacity',
				name: 'watermark_opacity',
				type: 'number',
				default: 0.15,
				description: 'Watermark opacity from 0.0 to 1.0',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
					},
				},
			},
			{
				displayName: 'Angle',
				name: 'watermark_angle',
				type: 'number',
				default: 30,
				description: 'Watermark rotation angle in degrees',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
					},
				},
			},
			{
				displayName: 'Font Size',
				name: 'watermark_font_size',
				type: 'number',
				default: 0,
				description: 'Optional font size override (set 0 to use API default)',
				displayOptions: {
					show: {
						operation: ['watermarkPdf'],
					},
				},
			},
			// Properties for Convert PDF to Image
			{
				displayName: 'Input Type',
				name: 'convert_pdf_image_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to convert by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'convert_pdf_image_url',
				type: 'string',
				default: '',
				description: 'Public URL of the PDF to convert',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
						convert_pdf_image_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Property',
				name: 'convert_pdf_image_file_binary_property',
				type: 'string',
				default: 'data',
				description: 'Binary property containing the PDF file',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
						convert_pdf_image_input_type: ['file'],
					},
				},
			},
			{
				displayName: 'Page',
				name: 'convert_pdf_image_page',
				type: 'number',
				default: 1,
				description: 'Single page number to convert (used when Pages is empty)',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
					},
				},
			},
			{
				displayName: 'Pages',
				name: 'convert_pdf_image_pages',
				type: 'string',
				default: '',
				description: 'Optional pages selection, for example 1-3 or 1,3,5',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
					},
				},
			},
			{
				displayName: 'Image Format',
				name: 'convert_pdf_image_format',
				type: 'options',
				options: [
					{ name: 'PNG', value: 'png' },
					{ name: 'JPG', value: 'jpg' },
					{ name: 'JPEG', value: 'jpeg' },
					{ name: 'WEBP', value: 'webp' },
				],
				default: 'png',
				description: 'Output image format',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
					},
				},
			},
			{
				displayName: 'DPI',
				name: 'convert_pdf_image_dpi',
				type: 'number',
				default: 150,
				description: 'Rasterization DPI (72-300)',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
					},
				},
			},
			{
				displayName: 'Quality',
				name: 'convert_pdf_image_quality',
				type: 'number',
				default: 85,
				description: 'Image quality from 1 to 100',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
					},
				},
			},
			{
				displayName: 'Output Type',
				name: 'convert_pdf_image_output',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'Base64', value: 'base64' },
					{ name: 'Both', value: 'both' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Format of the converted image output',
				displayOptions: {
					show: {
						operation: ['convertPdfToImage'],
					},
				},
			},
			// Properties for Convert Image to PDF
			{
				displayName: 'Image URLs',
				name: 'convert_image_pdf_urls',
				type: 'string',
				default: '',
				description: 'Single URL or comma-separated image URLs (max 100)',
				displayOptions: {
					show: {
						operation: ['convertImageToPdf'],
					},
				},
			},
			{
				displayName: 'Output Type',
				name: 'convert_image_pdf_output',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'Base64', value: 'base64' },
					{ name: 'Both', value: 'both' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Format of the generated PDF output',
				displayOptions: {
					show: {
						operation: ['convertImageToPdf'],
					},
				},
			},
			{
				displayName: 'Output Filename',
				name: 'convert_image_pdf_filename',
				type: 'string',
				default: 'combined-images.pdf',
				description: 'Optional output filename for file mode',
				displayOptions: {
					show: {
						operation: ['convertImageToPdf'],
					},
				},
			},
			// Properties for Lock PDF
			{
				displayName: 'Input Type',
				name: 'lock_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to lock by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'lock_url',
				type: 'string',
				default: '',
				description: 'URL of the PDF to lock (max 10MB)',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
						lock_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Property',
				name: 'lock_file_binary_property',
				type: 'string',
				default: 'data',
				description: 'Binary property containing the PDF file',
				displayOptions: {
					show: {
						operation: ['lockPdf'],
						lock_input_type: ['file'],
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
				displayName: 'Input Type',
				name: 'unlock_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to unlock by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['unlockPdf'],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'unlock_url',
				type: 'string',
				default: '',
				description: 'URL of the password-protected PDF to unlock (max 10MB)',
				displayOptions: {
					show: {
						operation: ['unlockPdf'],
						unlock_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Property',
				name: 'unlock_file_binary_property',
				type: 'string',
				default: 'data',
				description: 'Binary property containing the PDF file',
				displayOptions: {
					show: {
						operation: ['unlockPdf'],
						unlock_input_type: ['file'],
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
				displayName: 'Input Type',
				name: 'parse_input_type',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url' },
					{ name: 'File', value: 'file' },
				],
				default: 'url',
				description: 'Choose whether to parse by URL or binary file input',
				displayOptions: {
					show: {
						operation: ['parsePdf', 'parsePdfOcr'],
					},
				},
			},
			{
				displayName: 'PDF URL',
				name: 'parse_url',
				type: 'string',
				default: '',
				description: 'Public URL of the PDF to parse',
				displayOptions: {
					show: {
						operation: ['parsePdf', 'parsePdfOcr'],
						parse_input_type: ['url'],
					},
				},
			},
			{
				displayName: 'File Binary Property',
				name: 'parse_file_binary_property',
				type: 'string',
				default: 'data',
				description: 'Binary property containing the PDF file',
				displayOptions: {
					show: {
						operation: ['parsePdf', 'parsePdfOcr'],
						parse_input_type: ['file'],
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
				displayName: 'Language',
				name: 'lang',
				type: 'string',
				default: 'eng',
				description: 'Tesseract language code(s), for example eng or eng+hin',
				displayOptions: {
					show: {
						operation: ['parsePdfOcr'],
					},
				},
			},
			{
				displayName: 'Pages',
				name: 'parse_pages',
				type: 'string',
				default: 'all',
				description: 'Page selection: all, a range like 1-3, or a list like 1,3,5-7',
				displayOptions: {
					show: {
						operation: ['parsePdf', 'parsePdfOcr'],
					},
				},
			},
			{
				displayName: 'DPI',
				name: 'dpi',
				type: 'number',
				default: 200,
				description: 'Rasterization DPI before OCR (72-400)',
				displayOptions: {
					show: {
						operation: ['parsePdfOcr'],
					},
				},
			},
			{
				displayName: 'PSM',
				name: 'psm',
				type: 'number',
				default: 3,
				description: 'Tesseract page segmentation mode (0-13)',
				displayOptions: {
					show: {
						operation: ['parsePdfOcr'],
					},
				},
			},
			{
				displayName: 'OEM',
				name: 'oem',
				type: 'number',
				default: 3,
				description: 'Tesseract OCR engine mode (0-3)',
				displayOptions: {
					show: {
						operation: ['parsePdfOcr'],
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

		const createSingleFileMultipart = async (
			itemIndex: number,
			binaryPropertyName: string,
			fileFieldName: string,
			fields: Record<string, unknown>,
		): Promise<{ formData: Record<string, unknown> }> => {
			const binaryItem = items[itemIndex].binary?.[binaryPropertyName] as
				| { fileName?: string; mimeType?: string }
				| undefined;
			if (!binaryItem) {
				throw new NodeOperationError(
					this.getNode(),
					`Binary property "${binaryPropertyName}" not found`,
					{ itemIndex },
				);
			}

			const fileBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
			const formData: Record<string, unknown> = { ...fields };
			formData[fileFieldName] = {
				value: fileBuffer,
				options: {
					filename: binaryItem.fileName ?? `${fileFieldName}.pdf`,
					contentType: binaryItem.mimeType ?? 'application/pdf',
				},
			};

			return { formData };
		};

		const createMultiFileMultipart = async (
			itemIndex: number,
			binaryPropertyNames: string[],
			fileFieldName: string,
			fields: Record<string, unknown>,
		): Promise<{ formData: Record<string, unknown> }> => {
			const formData: Record<string, unknown> = { ...fields };
			const files: Array<{ value: Buffer; options: { filename: string; contentType: string } }> = [];

			for (const binaryPropertyName of binaryPropertyNames) {
				const trimmed = binaryPropertyName.trim();
				if (!trimmed) continue;
				const binaryItem = items[itemIndex].binary?.[trimmed] as
					| { fileName?: string; mimeType?: string }
					| undefined;
				if (!binaryItem) {
					throw new NodeOperationError(
						this.getNode(),
						`Binary property "${trimmed}" not found`,
						{ itemIndex },
					);
				}

				const fileBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, trimmed);
				files.push({
					value: fileBuffer,
					options: {
						filename: binaryItem.fileName ?? `${trimmed}.pdf`,
						contentType: binaryItem.mimeType ?? 'application/pdf',
					},
				});
			}

			if (files.length < 2) {
				throw new NodeOperationError(this.getNode(), 'At least 2 binary PDF properties are required', {
					itemIndex,
				});
			}

			formData[fileFieldName] = files;
			return { formData };
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
						const mergeInputType = this.getNodeParameter('merge_input_type', i) as string;
						const outputType = this.getNodeParameter('merge_output', i) as string;

						const body: Record<string, unknown> = {
							output: outputType,
						};

						const requestOptions =
							mergeInputType === 'file'
								? await createMultiFileMultipart(
										i,
										(this.getNodeParameter('merge_file_binary_properties', i) as string)
											.split(',')
											.map((name) => name.trim())
											.filter((name) => name),
										'files',
										body,
								  )
								: (() => {
										const pdfUrlsString = this.getNodeParameter('pdf_urls', i) as string;
										const urls = pdfUrlsString
											.split(',')
											.map((url) => url.trim())
											.filter((url) => url);

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

										body.urls = urls;
										return { body, json: true };
								  })();

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/pdf/merge',
									...requestOptions,
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
									...requestOptions,
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
						const splitInputType = this.getNodeParameter('split_input_type', i) as string;
						const splitMode = this.getNodeParameter('split_mode', i) as string;
						const outputType = this.getNodeParameter('split_output', i) as string;

						const body: Record<string, unknown> = {
							output: outputType,
						};

						if (splitInputType === 'url') {
							body.url = this.getNodeParameter('split_url', i) as string;
						}

						if (splitMode === 'pages') {
							body.pages = this.getNodeParameter('pages', i) as string;
						} else if (splitMode === 'each') {
							body.mode = 'each';
						} else if (splitMode === 'chunks') {
							body.chunks = this.getNodeParameter('chunks', i) as number;
						}

						const requestOptions =
							splitInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('split_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/pdf/split',
									...requestOptions,
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
									...requestOptions,
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
						const compressInputType = this.getNodeParameter('compress_input_type', i) as string;
						const compression = this.getNodeParameter('compression', i) as string;
						const outputType = this.getNodeParameter('compress_output', i) as string;
						const outputName = this.getNodeParameter('compress_output_name', i) as string;

						const body: Record<string, unknown> = {
							compression,
							output: outputType,
							output_name: outputName,
						};

						if (compressInputType === 'url') {
							body.url = this.getNodeParameter('compress_url', i) as string;
						}

						const requestOptions =
							compressInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('compress_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/compressPdf',
									...requestOptions,
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
									...requestOptions,
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
					} else if (operation === 'watermarkPdf') {
						const watermarkInputType = this.getNodeParameter('watermark_input_type', i) as string;
						const outputFormat = this.getNodeParameter('watermark_output_format', i) as string;
						const text = this.getNodeParameter('watermark_text', i) as string;
						const opacity = this.getNodeParameter('watermark_opacity', i) as number;
						const angle = this.getNodeParameter('watermark_angle', i) as number;
						const fontSize = this.getNodeParameter('watermark_font_size', i) as number;

						const body: Record<string, unknown> = {
							output_format: outputFormat,
							text,
							opacity,
							angle,
						};

						if (watermarkInputType === 'url') {
							body.file_url = this.getNodeParameter('watermark_file_url', i) as string;
						}

						if (fontSize > 0) {
							body.font_size = fontSize;
						}

						const requestOptions =
							watermarkInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('watermark_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						if (outputFormat === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/watermark',
									...requestOptions,
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
								'watermarked.pdf',
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
									url: 'https://pdfmunk.com/api/v1/watermark',
									...requestOptions,
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
					} else if (operation === 'convertPdfToImage') {
						const convertInputType = this.getNodeParameter('convert_pdf_image_input_type', i) as string;
						const page = this.getNodeParameter('convert_pdf_image_page', i) as number;
						const pages = this.getNodeParameter('convert_pdf_image_pages', i, '') as string;
						const imageFormat = this.getNodeParameter('convert_pdf_image_format', i) as string;
						const dpi = this.getNodeParameter('convert_pdf_image_dpi', i) as number;
						const quality = this.getNodeParameter('convert_pdf_image_quality', i) as number;
						const output = this.getNodeParameter('convert_pdf_image_output', i) as string;

						const body: Record<string, unknown> = {
							image_format: imageFormat,
							dpi,
							quality,
							output,
						};

						if (convertInputType === 'url') {
							body.url = this.getNodeParameter('convert_pdf_image_url', i) as string;
						}

						if ((pages ?? '').trim() !== '') {
							body.pages = pages;
						} else if (page > 0) {
							body.page = page;
						}

						const requestOptions =
							convertInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('convert_pdf_image_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						if (output === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/convert/pdf/image',
									...requestOptions,
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

							const headers = (responseData as { headers?: IDataObject }).headers ?? {};
							const contentType = (headers['content-type'] as string) ?? 'application/octet-stream';
							const filename = contentType.includes('zip')
								? 'pdf-to-images.zip'
								: `pdf-page.${imageFormat === 'jpg' ? 'jpg' : imageFormat}`;

							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(responseData.body as ArrayBuffer),
								filename,
								contentType,
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
									url: 'https://pdfmunk.com/api/v1/convert/pdf/image',
									...requestOptions,
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
					} else if (operation === 'convertImageToPdf') {
						const urlsInput = this.getNodeParameter('convert_image_pdf_urls', i) as string;
						const output = this.getNodeParameter('convert_image_pdf_output', i) as string;
						const outputFilename = this.getNodeParameter('convert_image_pdf_filename', i) as string;

						const urls = urlsInput
							.split(',')
							.map((url) => url.trim())
							.filter((url) => url);

						if (urls.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one image URL is required', {
								itemIndex: i,
							});
						}

						if (urls.length > 100) {
							throw new NodeOperationError(this.getNode(), 'Maximum 100 image URLs are allowed', {
								itemIndex: i,
							});
						}

						const body: Record<string, unknown> = {
							output,
							output_filename: outputFilename,
						};

						if (urls.length === 1) {
							body.image_url = urls[0];
						} else {
							body.image_urls = urls;
						}

						if (output === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/convert/image/pdf',
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
								outputFilename.endsWith('.pdf') ? outputFilename : `${outputFilename}.pdf`,
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
									url: 'https://pdfmunk.com/api/v1/convert/image/pdf',
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
						const lockInputType = this.getNodeParameter('lock_input_type', i) as string;
						const password = this.getNodeParameter('lock_password', i) as string;
						const inputPassword = this.getNodeParameter('lock_input_password', i, '') as string;
						const outputType = this.getNodeParameter('lock_output', i) as string;
						const outputName = this.getNodeParameter('lock_output_name', i) as string;

						const body: Record<string, unknown> = {
							password,
							output: outputType,
							output_name: outputName,
						};

						if (lockInputType === 'url') {
							body.url = this.getNodeParameter('lock_url', i) as string;
						}

						if (inputPassword) {
							body.input_password = inputPassword;
						}

						const requestOptions =
							lockInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('lock_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/lockPdf',
									...requestOptions,
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
									...requestOptions,
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
						const unlockInputType = this.getNodeParameter('unlock_input_type', i) as string;
						const password = this.getNodeParameter('unlock_password', i) as string;
						const outputType = this.getNodeParameter('unlock_output', i) as string;
						const outputName = this.getNodeParameter('unlock_output_name', i) as string;

						const body: Record<string, unknown> = {
							password,
							output: outputType,
							output_name: outputName,
						};

						if (unlockInputType === 'url') {
							body.url = this.getNodeParameter('unlock_url', i) as string;
						}

						const requestOptions =
							unlockInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('unlock_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						if (outputType === 'file') {
							const responseData = await this.helpers.httpRequestWithAuthentication.call(
								this,
								'htmlcsstopdfApi',
								{
									method: 'POST',
									url: 'https://pdfmunk.com/api/v1/unlockPdf',
									...requestOptions,
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
									...requestOptions,
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
						const parseInputType = this.getNodeParameter('parse_input_type', i) as string;
						const mode = this.getNodeParameter('parse_mode', i) as string;
						const pages = this.getNodeParameter('parse_pages', i) as string;

						const body: Record<string, unknown> = {
							mode,
							pages,
						};

						if (parseInputType === 'url') {
							body.url = this.getNodeParameter('parse_url', i) as string;
						}

						const requestOptions =
							parseInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('parse_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'htmlcsstopdfApi',
							{
								method: 'POST',
								url: 'https://pdfmunk.com/api/v1/pdf/parse',
								...requestOptions,
								returnFullResponse: true,
							},
						);
						const statusCode = (responseData as { statusCode?: number }).statusCode ?? 0;
						const bodyData = toJsonObject((responseData as { body?: unknown }).body);
						returnData.push({
							json: statusCode >= 400 ? { ...bodyData, statusCode } : bodyData,
							pairedItem: { item: i },
						});
					} else if (operation === 'parsePdfOcr') {
						const parseInputType = this.getNodeParameter('parse_input_type', i) as string;
						const pages = this.getNodeParameter('parse_pages', i) as string;
						const lang = this.getNodeParameter('lang', i) as string;
						const dpi = this.getNodeParameter('dpi', i) as number;
						const psm = this.getNodeParameter('psm', i) as number;
						const oem = this.getNodeParameter('oem', i) as number;

						const body: Record<string, unknown> = {
							pages,
							lang,
							dpi,
							psm,
							oem,
						};

						if (parseInputType === 'url') {
							body.url = this.getNodeParameter('parse_url', i) as string;
						}

						const requestOptions =
							parseInputType === 'file'
								? await createSingleFileMultipart(
										i,
										this.getNodeParameter('parse_file_binary_property', i) as string,
										'file',
										body,
								  )
								: { body, json: true };

						const responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'htmlcsstopdfApi',
							{
								method: 'POST',
								url: 'https://pdfmunk.com/api/v1/pdf/ocr/parse',
								...requestOptions,
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

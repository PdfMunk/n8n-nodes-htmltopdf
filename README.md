# n8n-nodes-htmlcsstopdf

[
  ![HTML to PDF Banner](images/pdfmunkbanner.png)
](https://pdfmunk.com)

An n8n community node for **PDFMunk** (Get your API key from [https://pdfmunk.com](https://pdfmunk.com)) that can convert HTML to PDF, capture website screenshots, and parse/merge/split/compress/lock/unlock PDFs.

## Features

- **HTML to PDF**: Convert custom HTML/CSS content to PDF documents
- **URL to PDF (Website Screenshot)**: Capture full-page website screenshots as PDF files
- **PDF Parse / Extract**: Parse PDFs into structured JSON (text, layout, tables, full)
- **PDF Merge**: Merge up to 15 PDFs into a single PDF
- **PDF Split**: Extract pages, split each page, or split into N chunks
- **PDF Compress**: Reduce PDF file size with adjustable compression levels
- **PDF Lock / Unlock**: Add or remove password protection
- **Flexible Output**: URL / File / Base64 outputs (varies by operation)
- **Customizable Viewport + Timeout**: Control rendering viewport and timeouts for PDF creation

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter `n8n-nodes-htmlcsstopdf`
4. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n/nodes

# Install the package
npm install n8n-nodes-htmlcsstopdf
```

### Docker

Add the package to your n8n Docker container:

```dockerfile
FROM n8nio/n8n:latest
USER root
RUN npm install -g n8n-nodes-htmlcsstopdf
USER node
```

## Getting Your PDFMunk API Key

1. **Sign Up**: Visit [PDFMunk.com](https://pdfmunk.com) and create an account
2. **Verify Email**: Check your email and verify your account
3. **Access Dashboard**: Log in to your PDFMunk dashboard
4. **Generate API Key**: 
   - Navigate to the "API Keys" section
   - Click "Generate New API Key"
   - Copy your API key securely
5. **Choose Plan**: Select a plan based on your usage needs:
   - **Free Tier**: 100 conversions/month
   - **Starter**: 1,000 conversions/month
   - **Professional**: 10,000 conversions/month
   - **Enterprise**: Custom limits

## Configuration

### Setting Up Credentials

1. In n8n, go to **Credentials**
2. Click **+ Add Credential**
3. Search for "HtmlCssToPdf API"
4. Enter your PDFMunk API key
5. Test the connection
6. Save the credential

## Operations

API reference docs:
https://www.pdfmunk.com/api-docs

### HTML to PDF
Convert custom HTML and CSS content into PDF documents.

**Parameters:**
- **HTML Content**: The HTML content to convert
- **CSS Content**: Optional CSS styling for the HTML
- **Viewport Width**: Viewport width in pixels (default: 1080)
- **Viewport Height**: Viewport height in pixels (default: 720)
- **Output Format**: Choose between URL or File output
- **Timeout**: Request timeout in seconds (default: 300 seconds = 5 minutes). Increase this for large PDFs.

**Example Use Cases:**
- Generate invoices from HTML templates
- Create reports with custom styling
- Convert rich text content to PDF documents

### URL to PDF
Capture website screenshots and save them as PDF documents.

**Parameters:**
- **URL**: The website URL to capture
- **Full Page**: Capture the entire page (default: true)
- **Wait Time**: Milliseconds to wait before capturing (default: 10000)
- **Viewport Width**: Viewport width in pixels (default: 1080)
- **Viewport Height**: Viewport height in pixels (default: 720)
- **Output Format**: Choose between URL or File output
- **Timeout**: Request timeout in seconds (default: 300 seconds = 5 minutes). Increase this for large PDFs.

**Example Use Cases:**
- Archive web pages as PDFs
- Generate website screenshots for documentation
- Create visual reports of web content

### PDF Merge
Merge multiple PDF URLs into a single PDF.

**Parameters:**
- **PDF URLs**: Comma-separated list of PDF URLs (minimum 2, maximum 15)
- **Output Type**: `url` / `file` / `base64`

**Returns:**
- `url` / `base64`: JSON
- `file`: binary PDF

### PDF Split
Split a PDF or extract specific pages.

**Parameters:**
- **PDF URL**: URL of the PDF to split
- **Split Mode**: Extract Pages / Split Each Page / Split Into Chunks
- **Page Range**: e.g. `1-5`, `1,3,5`, `10-` (only for Extract Pages)
- **Number of Chunks**: (only for Split Into Chunks)
- **Output Type**: `url` / `file` / `base64`

**Returns:**
- `url` / `base64`: JSON
- `file`: binary file (PDF/ZIP depending on API response)

### PDF Compress
Compress a PDF to reduce file size.

**Parameters:**
- **PDF URL**: URL of the PDF to compress
- **Compression Level**: Low / Medium / High / Max
- **Output Type**: `url` / `file` / `base64`
- **Output Filename**: output name when returning a file

**Returns:**
- `url` / `base64`: JSON
- `file`: binary PDF

### PDF Lock
Add password protection to a PDF.

**Parameters:**
- **PDF URL**: URL of the PDF to lock
- **Password**: password to set
- **Input Password**: optional (if the input PDF is already encrypted)
- **Output Type**: `url` / `file` / `base64`
- **Output Filename**

**Returns:**
- `url` / `base64`: JSON
- `file`: binary PDF

### PDF Unlock
Remove password protection from a PDF.

**Parameters:**
- **PDF URL**: URL of the password-protected PDF to unlock
- **Password**: password to unlock
- **Output Type**: `url` / `file` / `base64`
- **Output Filename**

**Returns:**
- `url` / `base64`: JSON
- `file`: binary PDF

### PDF Parse / Extract
Parse a PDF into structured JSON.

**Parameters:**
- **PDF URL**: URL of the PDF to parse
- **Parse Mode**: `text` / `layout` / `tables` / `full`
- **Pages**: `all` or a range like `1-3`

**Returns:** JSON (extracted text/structure)

## Usage

### Basic HTML to PDF Conversion

```json
{
  "operation": "htmlToPdf",
  "html_content": "<h1>Hello World</h1><p>This is a test document.</p>",
  "css_content": "h1 { color: blue; } p { font-size: 14px; }",
  "viewPortWidth": 1080,
  "viewPortHeight": 720,
  "output_format": "file",
  "timeout": 300
}
```

### Advanced Usage Examples

#### 1. Invoice Generation
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .invoice { font-family: Arial, sans-serif; }
        .header { background-color: #f0f0f0; padding: 20px; }
        .total { font-weight: bold; font-size: 18px; }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <h1>Invoice #12345</h1>
        </div>
        <div class="total">Total: $299.99</div>
    </div>
</body>
</html>
```

#### 2. Report Generation
```html
<div class="report">
    <h1>Monthly Report</h1>
    <table border="1">
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Sales</td><td>$50,000</td></tr>
        <tr><td>Growth</td><td>15%</td></tr>
    </table>
</div>
```

#### 3. Certificate Generation
```html
<div class="certificate">
    <h1>Certificate of Completion</h1>
    <p>This certifies that <strong>John Doe</strong> has completed the course.</p>
    <div class="signature">Authorized Signature</div>
</div>
```

## Use Cases

### Business Applications
- **Invoice Generation**: Automatically generate invoices from order data
- **Report Creation**: Convert analytics data into professional PDF reports
- **Contract Generation**: Create contracts from templates with dynamic data
- **Certificate Issuance**: Generate certificates for course completions
- **Receipt Creation**: Convert transaction data into PDF receipts

### Content Management
- **Document Archival**: Convert web pages to PDF for archival purposes
- **Newsletter PDFs**: Transform HTML newsletters into PDF format
- **eBook Creation**: Generate PDF books from HTML content
- **Documentation**: Convert online docs to downloadable PDFs

### Marketing & Sales
- **Proposal Generation**: Create branded proposals from CRM data
- **Brochure Creation**: Generate marketing materials dynamically
- **Price Lists**: Convert product catalogs to PDF format
- **Quotation PDFs**: Transform quotes into professional PDFs

## Workflow Examples

### Example 1: E-commerce Invoice
```json
{
  "nodes": [
    {
      "name": "Order Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "name": "Generate Invoice HTML",
      "type": "n8n-nodes-base.function"
    },
    {
      "name": "Convert to PDF",
      "type": "n8n-nodes-htmlcsstopdf.htmlcsstopdf"
    },
    {
      "name": "Email PDF",
      "type": "n8n-nodes-base.emailSend"
    }
  ]
}
```

### Example 2: Scheduled Reports
```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.cron"
    },
    {
      "name": "Fetch Analytics Data",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "name": "Build Report HTML",
      "type": "n8n-nodes-base.function"
    },
    {
      "name": "Generate PDF Report",
      "type": "n8n-nodes-htmlcsstopdf.htmlcsstopdf"
    },
    {
      "name": "Save to Google Drive",
      "type": "n8n-nodes-base.googleDrive"
    }
  ]
}
```

## Output

The node returns:
- **URL format**: Direct link to the generated PDF
- **File format**: Binary PDF file data that can be saved or sent via email

## Error Handling

The node provides detailed error messages for common issues:

- **Invalid API Key**: Check your PDFMunk credentials
- **HTML Parse Error**: Validate your HTML syntax
- **CSS Error**: Check your CSS for syntax errors
- **Rate Limit**: Upgrade your PDFMunk plan or wait for reset
- **Network Error**: Check your internet connection
- **Timeout Error**: Increase the timeout setting for large PDFs (default: 300 seconds)

## FAQ

**Q: Is there a free tier?**  
A: Yes, PDFMunk offers 100 free conversions per month.

**Q: What HTML features are supported?**  
A: Most modern HTML5 and CSS3 features are supported, including flexbox, grid, and media queries.

**Q: Can I use external images?**  
A: Yes, images accessible via URL will be included in the PDF.

**Q: What's the maximum file size?**  
A: PDFs can be up to 10MB on most plans. Check PDFMunk documentation for current limits.

**Q: How do I generate large PDFs (100+ pages)?**  
A: Increase the timeout setting in the node configuration. For large PDFs, set timeout to 600-900 seconds (10-15 minutes).

**Q: What should I do if I get a gateway timeout error?**  
A: Increase the timeout parameter in the node settings. The default is 300 seconds (5 minutes), but large PDFs may need 600-900 seconds.

## Compatibility

- **n8n version**: 0.187.0+
- **Node.js**: 18.0.0+
- **Supported formats**: HTML, CSS, PDF

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [PDFMunk API Documentation](https://pdfmunk.com/api-docs)
- [n8n workflow examples](https://n8n.io/workflows)

## Support

For questions or support, please contact us at: **support@pdfmunk.com**

You can also join the [n8n community forum](https://community.n8n.io/) for general n8n-related discussions.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## License

MIT License - see [LICENSE.md](LICENSE.md) file for details.

## Changelog

### v2.1.1
- Added configurable timeout parameter for large PDF generation
- Improved error handling for gateway timeouts
- Updated documentation with timeout troubleshooting

### v2.0.2
- Improved error handling
- Performance optimizations

### v2.0.1
- Bug fixes and stability improvements

### v2.0.0
- Complete rewrite with new PDFMunk API
- Enhanced CSS support
- Better error messages

---

Built with ❤️ for the n8n community

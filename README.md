# n8n-nodes-htmlcsstopdf

![HTML to PDF Banner](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

An n8n community node for converting HTML content to PDF documents and capturing website screenshots as PDFs using the PDFMunk API.

## Features

- **HTML to PDF**: Convert custom HTML/CSS content to PDF documents
- **Website to PDF**: Capture full-page website screenshots as PDF files
- **Flexible Output**: Support for URL, PNG, and Base64 response formats
- **Customizable Viewport**: Configure viewport dimensions for optimal rendering
- **Full Page Capture**: Option to capture entire web pages or specific viewport areas

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Install via n8n's Community Nodes feature:
1. Go to Settings > Community Nodes in your n8n instance
2. Install `n8n-nodes-htmlcsstopdf`

Or install manually:
```bash
npm install n8n-nodes-htmlcsstopdf
```

## Prerequisites

- n8n version 0.187.0 or higher
- PDFMunk API credentials (sign up at [PDFMunk](https://pdfmunk.com))

## Credentials

This node requires PDFMunk API credentials:

1. Create an account at [PDFMunk](https://pdfmunk.com)
2. Generate your API key from the dashboard
3. In n8n, create new credentials of type "HTMLCSStoPDF API"
4. Enter your PDFMunk API key

## Operations

### HTML to PDF
Convert custom HTML and CSS content into PDF documents.

**Parameters:**
- **HTML Content**: The HTML content to convert
- **CSS Content**: Optional CSS styling for the HTML
- **Viewport Width**: Viewport width in pixels (default: 1080)
- **Viewport Height**: Viewport height in pixels (default: 720)
- **Response Format**: Choose between URL, PNG, or Base64 output

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

**Example Use Cases:**
- Archive web pages as PDFs
- Generate website screenshots for documentation
- Create visual reports of web content

## Example Workflows

### Generate Invoice PDF
```javascript
// Previous node provides customer data
{
  "operation": "htmlToPdf",
  "html_content": `
    <html>
      <body>
        <h1>Invoice #{{$json.invoiceNumber}}</h1>
        <p>Customer: {{$json.customerName}}</p>
        <p>Amount: ${{$json.amount}}</p>
      </body>
    </html>
  `,
  "css_content": `
    body { font-family: Arial, sans-serif; }
    h1 { color: #333; }
  `,
  "response_format": "base64"
}
```

### Website Screenshot
```javascript
{
  "operation": "urlToPdf",
  "url": "https://example.com",
  "full_page": true,
  "wait_till": 5000,
  "viewPortWidth": 1920,
  "viewPortHeight": 1080
}
```

## Output

The node returns:
- **URL format**: Direct link to the generated PDF
- **PNG format**: PNG image data
- **Base64 format**: Base64 encoded PDF data

## Error Handling

The node includes comprehensive error handling:
- Invalid HTML/CSS content
- Network connectivity issues
- API rate limiting
- Invalid URLs or parameters

## Compatibility

- **n8n version**: 0.187.0+
- **Node.js**: 18.0.0+
- **Supported formats**: HTML, CSS, PDF, PNG, Base64

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [PDFMunk API Documentation](https://pdfmunk.com/api-docs)
- [n8n workflow examples](https://n8n.io/workflows)

## Support

- Report issues on [GitHub](https://github.com/yourusername/n8n-nodes-htmlcsstopdf)
- Join the [n8n community](https://community.n8n.io/)
- Check [PDFMunk support](https://pdfmunk.com/support)

## Version History

- **1.0.0**: Initial release with HTML to PDF and URL to PDF operations

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## License

[MIT](LICENSE.md)

---

Built with ❤️ for the n8n community
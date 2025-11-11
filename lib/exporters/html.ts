/**
 * Convert TLDraw whiteboard data to HTML format
 */
export function exportToHTML(whiteboardData: any, whiteboardName: string): string {
  const shapes = Object.values(whiteboardData.records || {}).filter(
    (record: any) => record.typeName === "shape"
  )

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${whiteboardName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
        }
        .shape {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #3b82f6;
            background: #f8fafc;
            border-radius: 4px;
        }
        .shape-type {
            font-weight: 600;
            color: #3b82f6;
            text-transform: uppercase;
            font-size: 12px;
            margin-bottom: 8px;
        }
        .shape-content {
            color: #333;
            line-height: 1.6;
        }
        .metadata {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${whiteboardName}</h1>
`

  // Add shapes
  shapes.forEach((shape: any) => {
    const type = shape.type || "unknown"
    const text = shape.props?.text || ""
    const geo = shape.props?.geo || ""

    if (text || geo) {
      html += `
        <div class="shape">
            <div class="shape-type">${type}${geo ? ` (${geo})` : ""}</div>
            <div class="shape-content">${text || `[${type} shape]`}</div>
        </div>
`
    }
  })

  html += `
        <div class="metadata">
            <p>Exported from AI Whiteboard on ${new Date().toLocaleString()}</p>
            <p>Total shapes: ${shapes.length}</p>
        </div>
    </div>
</body>
</html>
`

  return html
}

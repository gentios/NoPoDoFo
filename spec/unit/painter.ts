import {npdf, CONVERSION, IPainter, NPDFFontEncoding, Cell, Table, NPDFAlignment, NPDFVerticalAlignment} from '../../dist'
import * as tap from 'tape'
import {join} from 'path';
if(!global.gc) {
    global.gc = () => {}
}
const filePath = join(__dirname, '../test-documents/test.pdf'),
    outFile = '/tmp/painter.out.pdf',
    doc = new npdf.Document()

tap('IPainter', t => {
    t.test('Document [MemDocument]', t => {
        doc.load(filePath, (err: Error) => {
            if (err) t.fail(err.message)
            else {
                let painter = new npdf.Painter(doc)
                let page = doc.getPage(0)
                painter.setPage(page)
                let font = doc.createFont({
                    fontName: 'monospace',
                    bold: false,
                    embed: false,
                    encoding: NPDFFontEncoding.WinAnsi,
                    italic: true
                })
                
                painter.font = font
                const metric = font.getMetrics()
                let x: number, y: number
                x = CONVERSION * 10000
                y = page.height - 10000 * CONVERSION
                y -= metric.lineSpacing
                t.doesNotThrow(() => painter.drawText({x, y}, 'DRAW TEXT TEST'))
                x = 0
                let l: number, h: number, w: number, i: number
                let msg = "Grayscale - Colospace"
                h = metric.lineSpacing
                w = font.stringWidth(msg)
                y = page.height - 10000 * CONVERSION

                t.doesNotThrow(() => painter.drawText({x: 12000 * CONVERSION, y: y - h}, msg))
                let rect = new npdf.Rect(12000 * CONVERSION, y - h, w, h)
                painter.rectangle(rect)
                t.doesNotThrow(() => painter.stroke())

                let lineLength = 50000 * CONVERSION

                for (let s = 0; s < 5; s++) {
                    x += 10000 * CONVERSION
                    painter.setStrokeWidth((s * 1000) * CONVERSION)
                    painter.setStrokingGrey(s / 10.0)
                    t.doesNotThrow(() => painter.drawLine({x, y}, {x, y: y - lineLength}))
                }

                const table = new npdf.SimpleTable(doc, 5, 5)
                painter.setColor([0.0, 0.0, 0.0])
                table.font = font
                table.foregroundColor = [0.0, 0.0, 0.0]
                for (let c = 0; c < 5; c++) {
                    for (let r = 0; r < 5; r++) {
                        const cell = new Cell(table, c, r)
                        cell.text = 'A'
                    }
                }
                table.tableWidth = 200
                table.tableHeight = 200
                t.doesNotThrow(() => table.draw({x: 300, y: 300}, painter))

                let multiLineContainer = new npdf.Rect(300, 300, 150, 50)
                painter.drawMultiLineText(multiLineContainer, 'MULTILINE\nTEST')
                painter.finishPage()
                doc.write(outFile, (e: Error, d: any) => {
                    if (e instanceof Error) t.fail()
                    else {
                        let subject = new npdf.Document()
                        subject.load(outFile, e => {
                            if(e) t.fail(e.message)
                            else {
                                let contentsParser = new npdf.ContentsTokenizer(doc, 0)
                                let pageContents = contentsParser.readAll().join('');
                                ['MULTILINETEST', 'DRAW TEXT TEST'].forEach(i => {
                                    t.ok(pageContents.includes(i), 'page includes text')
                                })
                                t.end()
                            }
                        })
                    }
                })
            }
        })
    })
})


import * as tap from 'tape'
import { Document } from './document'
import { SignatureField } from './field'
import { NPDFAnnotation, NPDFAnnotationFlag } from './annotation'
import { Rect } from './rect'
import { join } from 'path'
import { IForm } from "./form";
import { Signer, signature } from "./signer";


tap('Signer', sub => {
    const doc = new Document(join(__dirname, '../test-documents/test.pdf'), true)
    doc.on('ready', async e => {
        sub.test('Sign Sync', async standard => {
            standard.plan(2)
            if (e instanceof Error) throw e
            try {
                if ((doc.form as IForm).dictionary.hasKey('SigFlags') ||
                    (doc.form as IForm).dictionary.getKey('SigFlags').type !== 'Number' ||
                    (doc.form as IForm).dictionary.getKey('SigFlags').getNumber() !== 3) {
                    (doc.form as IForm).dictionary.removeKey('SigFlags');
                    (doc.form as IForm).dictionary.addKey('SigFlags', 3)
                }
                if ((doc.form as IForm).needAppearances)
                    (doc.form as IForm).needAppearances = false

                const rect = new Rect([0, 0, 10, 10]),
                    page = doc.getPage(1),
                    annot = page.createAnnotation(NPDFAnnotation.Widget, rect)
                annot.flag = NPDFAnnotationFlag.Hidden | NPDFAnnotationFlag.Invisible
                const field = new SignatureField(annot, doc),
                    signatureData = await signature(join(__dirname, '../test-documents/certificate.pem'), join(__dirname, '../test-documents/key.pem'))
                standard.ok(signatureData)
                field.setReason('test')
                field.setLocation('here')
                field.setCreator('me')
                field.setFieldName('signer.sign')
                field.setDate()

                let signer = new Signer(doc)
                signer.setField(field)
                let signedPath = "/tmp/signed.pdf"
                signer.signSync(signatureData, signedPath)
                let signed = new Document(signedPath)
                signed.on('ready', e => {
                    if (e instanceof Error) standard.fail(e.message)
                    const signedPage = doc.getPage(1),
                        fields = signedPage.getFields()
                    let signatureFieldCandidates = fields.filter(i => i.getFieldName() === 'signer.sign')
                    if (!signatureFieldCandidates || signatureFieldCandidates.length === 0) standard.fail("signature field not found")
                    else if (signatureFieldCandidates.length === 1) {
                        standard.pass("signature found")
                    }
                    else standard.fail("something went wrong")
                })
            }
            catch
            (e) {
                console.error(e)
            }
        })

    })

})



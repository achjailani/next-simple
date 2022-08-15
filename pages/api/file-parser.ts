import type { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument } from 'pdf-lib'
import * as fs from 'fs'
import * as frd from 'formidable'

type ErrorType = {
  error: String
}

type Data = {
  x: number,
  y: number,
  page: number,
  rectangle_height: number,
  rectangle_width: number
}

type DumbParameter = {
  filePath: string,
  page: number,
  lowerLeftY: number,
  lowerLeftX: number,
  UpperRightY: number,
  UpperRightX: number,
  top: boolean
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorType>
) {
  const form =  new frd.IncomingForm()

  form.parse(req, (err: Error, fields: any, files: any ) => {
    if (err) {
      res.status(422).json({ error: String(err) })
      return
    }

    if (files && !fs.existsSync(files.file.filepath)) {
      return res.status(422).json({ error: 'Invalid file path ' })
    }

    if (!isFileValid(files.file)) {
      return res.status(422).json({ error: 'Invalid file type, only support pdf ' })
    }

    const toTop = fields.top.toLowerCase() == 'true' ? true : false

    convert({ 
      filePath: files.file.filepath, 
      page: parseInt(fields.page),
      lowerLeftY: parseInt(fields.lly), 
      lowerLeftX: parseInt(fields.llx), 
      UpperRightY: parseInt(fields.ury), 
      UpperRightX: parseInt(fields.urx), 
      top: toTop
    })
    .then((response: Data) => {
      res.status(200).json(response)
    })
    .catch((error: Error) => {
      res.status(422).json({ error: error.message })
    })
  })
}

type FilTypeParam = {
  mimetype: string
}

const isFileValid = (file: FilTypeParam): boolean => {
  const fileType = file.mimetype.split("/").pop() || '';
  const validTypes = ["pdf"];
  if (validTypes.indexOf(fileType) === -1) {
    return false;
  }
  return true;
};

const convert = async (arg: DumbParameter): Promise<Data> => {
  
  let pos_y: number = arg.UpperRightY
  const pdfDoc: any = await PDFDocument.load(fs.readFileSync(arg.filePath)) 

  if (arg.page < 1) {
    arg.page = 0
  }

  if (arg.page == 1) {
    arg.page = 0
  }

  const pageCount = await pdfDoc.getPageCount()

  if (arg.page > pageCount) {
    arg.page = pageCount - 1
  }

  if (arg.top == true) {
    const pageHeight: number = pdfDoc.getPage(0).getHeight()
    pos_y = pageHeight - pos_y
  }

  return {
    x: arg.UpperRightX,
    y: pos_y,
    page: arg.page,
    rectangle_height: arg.UpperRightY - arg.lowerLeftY,
    rectangle_width: arg.UpperRightX - arg.lowerLeftX
  }
}
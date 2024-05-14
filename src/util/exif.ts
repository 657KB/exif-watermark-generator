import ExifReader, { Tags } from 'exifreader'

const getEXIF = (image: File): Promise<Tags | string> => {
  return new Promise((resolve, reject) => {
    image.arrayBuffer()
      .then(arrayBuffer => resolve(ExifReader.load(arrayBuffer)))
      .catch(reason => reject(`${reason}`))
  })
}

export default getEXIF

import { Tags } from 'exifreader'
import { toJpeg } from 'html-to-image'

const createImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject('get image size error')
    image.src = url
    image.style.flex = 'none'
  })
}

const formatDateTime = (dateTime: string) => {
  if (dateTime === '') return dateTime
  const splited = dateTime.split(' ')
  if (splited.length < 2) return dateTime
  const date = splited[0]
  const time = splited[1]
  return `${date.replace(/\:/g, '.')}  ${time}`
}

const formatFNumber = (fNumber: string) => {
  const numStr = fNumber.replace('f/', '')
  const num = Number(numStr)
  if (typeof num === 'number' && !Number.isNaN(num)) {
    return `f/${num.toFixed(1)}`.replace('.0', '')
  }
  return fNumber
}

const createLogoImage = async (rawMake: string): Promise<HTMLImageElement> => {
  const make = rawMake.toLowerCase()
  let logoUrl = ''
  if (make.includes('apple')) {
    logoUrl = '/logo/apple.png'
  } else if (make.includes('canon')) {
    logoUrl = '/logo/canon.png'
  } else if (make.includes('dji')) {
    logoUrl = '/logo/dji.png'
  } else if (make.includes('fuji')) {
    logoUrl = '/logo/fujifilm.png'
  } else if (make.includes('hassel')) {
    logoUrl = '/logo/hasselblad.png'
  } else if (make.includes('leica')) {
    logoUrl = '/logo/leica.png'
  } else if (make.includes('nikon')) {
    logoUrl = '/logo/nikon.png'
  } else if (make.includes('olympus')) {
    logoUrl = '/logo/olympus.png'
  } else if (make.includes('panasonic')) {
    logoUrl = '/logo/panasonic.png'
  } else if (make.includes('pentax')) {
    logoUrl = '/logo/pentax.png'
  } else if (make.includes('ricoh')) {
    logoUrl = '/logo/ricoh.png'
  } else if (make.includes('sony')) {
    logoUrl = '/logo/sony.png'
  } else if (make.includes('xmage')) {
    logoUrl = '/logo/xmage.png'
  }
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (logoUrl !== '') {
      image.src = logoUrl
      image.onload = () => resolve(image)
      image.onerror = () => reject('failed to get logo')
    } else {
      resolve(image)
    }
  })
}

export const generateImageWithExifPhotoFrame = async (imageFile: File, exif: Tags) => {
  const image = await createImage(imageFile)

  const dateTime = exif.DateTime?.description || ''
  const model = exif.Model?.description || ''
  const make = exif.Make?.description || ''
  const lensModel = exif.LensModel?.description || ''
  const focalLength = exif.FocalLengthIn35mmFilm?.description || exif.FocalLength?.description || 'unkonwn'
  const fNumber = formatFNumber(exif.FNumber?.description || 'unkonwn')
  const exposeureTime = exif.ExposureTime?.description || 'unkonwn'
  const isoSpeedRatings = exif.ISOSpeedRatings?.description || 'unkonwn'

  const footerHeight = image.width > image.height ? image.height * 0.16 : image.height * 0.1
  const primaryFontSize = image.width > image.height ? `${footerHeight * 0.2}px` : `${footerHeight * 0.18}px`
  const primaryLineHeight = image.width > image.height ? `${footerHeight * 0.3}px` : `${footerHeight * 0.26}px`
  const secondaryFontSize = image.width > image.height ? `${footerHeight * 0.15}px` : `${footerHeight * 0.14}px`
  const secondaryLineHeight = image.width > image.height ? `${footerHeight * 0.2}px` : `${footerHeight * 0.18}px`

  const container = document.createElement('div')
  container.classList.add('generate-col')
  container.style.width = `${image.width}px`
  container.style.height = `${image.height + footerHeight}px`
  container.style.background = `#fff`

  const footer = document.createElement('div')
  footer.classList.add('generate-row')
  footer.classList.add('generate-footer')
  footer.style.width = `100%`
  footer.style.flex = `1`
  footer.style.padding = `0 ${footerHeight * 0.3}px`

  const footerLeft = document.createElement('div')
  footerLeft.classList.add('generate-col')
  footerLeft.style.flex = `1`
  footerLeft.style.paddingRight = `${footerHeight * 0.3}px`

  const footerLeftLine1 = document.createElement('div')
  footerLeftLine1.classList.add('generate-footer-text-primary')
  footerLeftLine1.innerText = model
  footerLeftLine1.style.fontSize = primaryFontSize
  footerLeftLine1.style.lineHeight = primaryLineHeight

  const footerLeftLine2 = document.createElement('div')
  footerLeftLine2.classList.add('generate-footer-text-secondary')
  footerLeftLine2.innerText = lensModel
  footerLeftLine2.style.fontSize = secondaryFontSize
  footerLeftLine2.style.lineHeight = secondaryLineHeight

  const footerLogo = await createLogoImage(make)
  footerLogo.style.height = `${footerHeight * 0.46}px`

  const footerDivider = document.createElement('div')
  footerDivider.classList.add('generate-footer-divider')
  footerDivider.style.height = `${footerHeight * 0.56}px`
  footerDivider.style.margin = `0 ${footerHeight * 0.16}px`
  footerDivider.style.backgroundColor = image.width > image.height ? 'rgba(0, 0, 0, .2)' : `rgba(0, 0, 0, .4)`

  const footerRight = document.createElement('div')
  footerRight.classList.add('generate-col')

  const footerExif = document.createElement('div')
  footerExif.classList.add('generate-footer-text-primary')
  footerExif.innerText = `${`${focalLength}`.replace(/\s/g, '')}${`${focalLength}`.endsWith('mm') ? '' : 'mm'}  ${fNumber}  ${exposeureTime}s  ISO${isoSpeedRatings}`
  footerExif.style.fontSize = primaryFontSize
  footerExif.style.lineHeight = primaryLineHeight
  footerExif.style.whiteSpace = 'pre'

  const footerDateTime = document.createElement('div')
  footerDateTime.classList.add('generate-footer-text-secondary')
  footerDateTime.innerText = formatDateTime(dateTime)
  footerDateTime.style.fontSize = secondaryFontSize
  footerDateTime.style.lineHeight = secondaryLineHeight
  footerDateTime.style.whiteSpace = 'pre'

  footerLeft.appendChild(footerLeftLine1)
  footerLeft.appendChild(footerLeftLine2)
  footerRight.appendChild(footerExif)
  footerRight.appendChild(footerDateTime)
  footer.appendChild(footerLeft)
  footer.appendChild(footerLogo)
  if (make !== '') footer.appendChild(footerDivider)
  footer.appendChild(footerRight)
  container.appendChild(image)
  container.appendChild(footer)

  document.getElementById('hidden')?.appendChild(container)

  return toJpeg(container, { quality: 0.5 }).then(url => {
    document.getElementById('hidden')?.firstChild?.remove()
    return url
  }).catch(error => {
    console.error(error)
    return null
  })
}

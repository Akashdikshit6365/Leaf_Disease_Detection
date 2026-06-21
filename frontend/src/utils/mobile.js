import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Toast } from '@capacitor/toast'
import { Network } from '@capacitor/network'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

/**
 * Check if running on mobile/native platform
 */
export const isNativePlatform = () => Capacitor.isNativePlatform()

/**
 * Get platform name (ios, android, web)
 */
export const getPlatform = () => Capacitor.getPlatform()

/**
 * Capture photo from camera or device gallery
 * @param {string} source - 'camera' or 'photos'
 * @returns {Promise<object>} - { webPath, base64 }
 */
export const capturePhoto = async (source = 'camera') => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
    })

    return {
      webPath: image.webPath,
      format: image.format,
    }
  } catch (error) {
    console.error('Camera error:', error)
    throw new Error('Failed to capture photo')
  }
}

/**
 * Convert photo to base64 for upload
 */
export const photoToBase64 = async (webPath) => {
  try {
    const response = await fetch(webPath)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(blob)
    })
  } catch (error) {
    console.error('Base64 conversion error:', error)
    throw error
  }
}

/**
 * Show native toast notification
 */
export const showToast = async (message, duration = 2000) => {
  if (isNativePlatform()) {
    await Toast.show({
      text: message,
      duration: duration > 3000 ? 'long' : 'short',
    })
  } else {
    console.log(message)
  }
}

/**
 * Check network connectivity
 */
export const checkNetworkStatus = async () => {
  try {
    const status = await Network.getStatus()
    return status.connected
  } catch (error) {
    console.error('Network status error:', error)
    return false
  }
}

/**
 * Save file to device storage
 */
export const saveFile = async (filename, data, directory = Directory.Documents) => {
  try {
    await Filesystem.writeFile({
      path: filename,
      data: data,
      directory: directory,
      encoding: Encoding.UTF8,
    })
    return true
  } catch (error) {
    console.error('Save file error:', error)
    throw error
  }
}

/**
 * Read file from device storage
 */
export const readFile = async (filename, directory = Directory.Documents) => {
  try {
    const file = await Filesystem.readFile({
      path: filename,
      directory: directory,
      encoding: Encoding.UTF8,
    })
    return file.data
  } catch (error) {
    console.error('Read file error:', error)
    throw error
  }
}

/**
 * Download file from URL and save locally
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const reader = new FileReader()
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          await saveFile(filename, reader.result)
          resolve(filename)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(blob)
    })
  } catch (error) {
    console.error('Download file error:', error)
    throw error
  }
}

export default {
  isNativePlatform,
  getPlatform,
  capturePhoto,
  photoToBase64,
  showToast,
  checkNetworkStatus,
  saveFile,
  readFile,
  downloadFile,
}

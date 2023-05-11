
import { FileValidator } from '@nestjs/common'
import { writeFileSync } from 'fs';
const os = require('os');
import {ffprobe}  from 'fluent-ffmpeg'


export class MaxFileSizeValidatorForJPEG extends FileValidator<{inputwidth:number, inputHeight:number,  maxSize: number }>{
    constructor(options: {inputwidth:number, inputHeight:number, maxSize: number }) {
        super(options)
    }

    isValid(file: Express.Multer.File): boolean | Promise<boolean>{
        
        if(file.mimetype != 'image/jpeg'){
            return  true
        }
        const in_mb = file.size / 1000000
        if(in_mb >= this.validationOptions.maxSize){
            return false
        }
        const filePath = `${os.tmpdir()}/temp-jpeg-10.jpeg`;
        
        writeFileSync(filePath, file.buffer);
        return new Promise((resolve, reject) => {
            ffprobe(filePath, (err, metadata) => {
                const { width, height } = metadata.streams[0];
                console.log(width, height)
                if(width < this.validationOptions.inputwidth || height < this.validationOptions.inputHeight){
                   resolve('error')
                }else{
                    resolve('success')
                }
            })
        }).then(res => {
            if(res == 'error'){
                return false
            }
            return true
        }).catch(err => {
            return false
        })
    }
    buildErrorMessage(): string {
        return `The max size is (${this.validationOptions.maxSize} MB) and resolution at least 1080p`
    }
}


export class ResolutionValidatorForMp4 extends FileValidator<{inputwidth:number, inputHeight:number, duration:number }>{
    constructor(options: { inputwidth:number, inputHeight:number, duration:number}) {
        super(options)
    }

    isValid(file: Express.Multer.File): boolean | Promise<boolean> {
        if(file.mimetype != 'video/mp4'){
            return  true
        }
        const inputDuration = this.validationOptions.duration 
        const filePath = `${os.tmpdir()}/temp-jpeg-5.mp4`;
        
        writeFileSync(filePath, file.buffer);
        return new Promise((resolve, reject)=> {
            ffprobe(filePath, (err, metadata) => {
                if (err) {
                    resolve('error')
                }
                const { duration } = metadata.format;
                const { width, height } = metadata.streams[0];
                if ((width < this.validationOptions.inputwidth || height < this.validationOptions.inputHeight) || duration > inputDuration) {
                    resolve('error')
                }else{
                    resolve('success')
                }
            })
        }).then(res => {
            if(res === 'error'){
                return false
            }
            return true
        }).catch(err => {
            return false
        })
    }
    buildErrorMessage(): string {
        return `The provided mp4 file resolution at least 720p and video length not grater than 1 min`
    }

}

export class Mp3DurationValidator extends FileValidator<{ duration:number }>{
    constructor(options: { duration:number }) {
        super(options)
    }
    
    isValid(file: Express.Multer.File): boolean | Promise<boolean> {
        if(file.mimetype != 'audio/mpeg'){
            return  true
        }
        const filePath = `${os.tmpdir()}/temp-sp.mp3`;
        writeFileSync(filePath, file.buffer);
        return new Promise((resolve,  reject) => {
            ffprobe(filePath, (err, metadata) => {
                if (err) {
                    resolve('error')
                }
                const { duration } = metadata.format;
                if (duration > this.validationOptions.duration) {
                    resolve('error')
                }else{
                    resolve('success')
                }
            }) 
        }).then(res => {
            if(res == 'error'){
                return false
            }
            return true
        }).catch(err => {
            return false
        })
    }

    buildErrorMessage(): string {
        return `The provided mp3 not greater than 1 min`
    }
}
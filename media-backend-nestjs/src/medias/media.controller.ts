import { Res, Req, Post, HttpStatus, Controller, UploadedFiles, Get, UseInterceptors, Delete, Param, ParseFilePipeBuilder } from '@nestjs/common'
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Request, Response, response } from 'express'
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createWriteStream, readFileSync } from 'fs';
import { MaxFileSizeValidatorForJPEG, ResolutionValidatorForMp4, Mp3DurationValidator } from './validators/media.validator'

function uploadMultipleFiles(files, mediaService: MediaService) {
    console.log('Writeeerr')
    return new Promise(async (resolve, reject) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (!file || !file.buffer) {
                reject('Invalid file in buffer')
            }
            const uniqueSuffix = uuidv4();
            const extension = extname(file.originalname);
            const filename = `${uniqueSuffix}${extension}`
            const filepath = `./uploads/${filename}`;
            const fileWriteStream = createWriteStream(filepath);
            fileWriteStream.write(file.buffer);
            fileWriteStream.close()
            await mediaService.createMedia(filename)
        }
        resolve({
            status: 'success'
        })
    })
}

@Controller('api')
export class MediaController {
    constructor(private mediaService: MediaService) { }

    @Get('medias')
    async getAllMedia(@Res() res: Response) {
        const medias = await this.mediaService.getAlll()
        return res.status(HttpStatus.OK).json({
            message: 'Data fetched',
            data: medias
        })
    }

    @Get('media/download/:id')
    async download(@Param() param, @Res() res: Response) {
        const media = await this.mediaService.findById(param.id)
        const file = readFileSync(join(__dirname, '../../uploads', media.file));
        res.contentType('blob')
        res.status(HttpStatus.OK).send(file)
    }


    @Delete('delete-media/:id')
    async deleteMedia(@Param() param: any, @Res() res: Response) {
        await this.mediaService.remove(param.id)
        return res.status(HttpStatus.OK).json({
            message: 'Data Deleted',
            data: []
        })
    }


    @Post('upload')
    @UseInterceptors(AnyFilesInterceptor())
    async uploadFile(
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpeg|png|mp4|mpeg)$/,
                }).addValidator(
                    new MaxFileSizeValidatorForJPEG({
                        inputwidth: 1280,
                        inputHeight: 720,
                        maxSize: 3
                    })
                ).addValidator(
                    new ResolutionValidatorForMp4({
                        inputwidth: 1280,
                        inputHeight: 720,
                        duration: 180
                    }),
                ).addValidator(
                    new Mp3DurationValidator({
                        duration: 60
                    })
                )
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) files: Array<Express.Multer.File>, @Res() res: Response) {
        const output = await uploadMultipleFiles(files, this.mediaService)
        return res.status(HttpStatus.OK).json({
            response: `success`,
            data: output
        })
    }





}
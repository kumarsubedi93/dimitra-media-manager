import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { Media } from "./media.entity";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Repository } from "typeorm";
import { Response } from "express";
import { HttpStatus, Res} from "@nestjs/common";


describe('MediaController', () => {
    let mediaController:MediaController
    let mediaService:MediaService
    let mediaModel:Repository<Media>
    let app 
    let responseMock:Response

    let mockMediaServices = {
        getAll:jest.fn(),
        findById:jest.fn(),
        createMedia:jest.fn(),
        remove:jest.fn()
    }

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [MediaController],
            providers: [MediaService],
        }).compile();

        mediaController = moduleRef.get<MediaController>(MediaController);
        mediaService = moduleRef.get<MediaService>(MediaService);
        app = moduleRef.createNestApplication();
        await app.init();
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('getMedia', () => {
       it('Should return and object with message and data property', async ()=> {
        const mockMedia = [{ id: 1, file: 'file 1' }, { id: 2, file: 'file 2' }];
        jest.spyOn(mediaService, 'getAll').mockResolvedValue(mockMedia);

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          } as unknown as Response;
       
        const response = await mediaController.getAllMedia(mockRes)
        console.log(response)
        expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Data fetched',
            data: mockMedia,
          });

        //expect(response.body).toEqual(mockMedia)
       }) 
    })

    describe('deleteMedia',  () => {
        it('Should return delete the media', async ()=> {
            const mediaMock = [{id:1, file:'file 1'}]
            jest.spyOn(mediaService, 'remove').mockResolvedValue()

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
              } as unknown as Response;

              const response = await mediaController.deleteMedia(1, mockRes)
              expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.OK);
              expect(mockRes.json).toHaveBeenCalledWith({
                    message: 'Data Deleted',
                    data: [],
                });
        })
    })
})
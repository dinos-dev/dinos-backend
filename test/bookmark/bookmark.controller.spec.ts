import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from '../../src/bookmark/bookmark.controller';
import { BookmarkService } from '../../src/bookmark/application/bookmark.service';

describe('BookmarkController', () => {
  let controller: BookmarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [BookmarkService],
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

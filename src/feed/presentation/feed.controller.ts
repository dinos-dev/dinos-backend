import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FeedService } from '../application/feed.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { Public } from 'src/common/decorator/public-access.decorator';
import { HttpResponse } from 'src/common/http/http-response';
import { HomeFeedResponseDto } from './dto/response/home-feed.response.dto';
import { FindAllFeedDocs, FindByHomeFeedDocs, FindByIdFeedDocs } from './swagger/rest-swagger.decorator';
import { FeedResponseDto } from './dto/response/feed.response.dto';
import { HttpFeedErrorConstants } from '../application/helper/http-error-object';

@ApiTags('Feed - 피드')
@ApiCommonErrorResponseTemplate()
@Controller('feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  //? 전체 피드 컬렉션 조회 -> Admin에서 적용
  @Public()
  @Get()
  @FindAllFeedDocs()
  async findAll(): Promise<HttpResponse<FeedResponseDto[]>> {
    const feeds = await this.feedService.findAll();
    const responseData = feeds.map(FeedResponseDto.fromDomain);
    return HttpResponse.ok(responseData);
  }

  //? 메인 홈 피드 조회
  @Get('home')
  @FindByHomeFeedDocs()
  async findByHomeFeeds(): Promise<HttpResponse<HomeFeedResponseDto[]>> {
    const homeFeeds = await this.feedService.findByHomeFeeds();
    const responseData = homeFeeds.map(HomeFeedResponseDto.fromDomain);

    return HttpResponse.ok(responseData);
  }

  //? ID기반 상세 조회
  @Get(':id')
  @FindByIdFeedDocs()
  async findById(@Param('id') id: string): Promise<HttpResponse<FeedResponseDto>> {
    const feed = await this.feedService.findById(id);

    // Feed 데이터가 없을 경우 핸들링
    if (!feed) {
      throw new NotFoundException(HttpFeedErrorConstants.NOT_FOUND_FEED_BY_ID);
    }

    const responseData = FeedResponseDto.fromDomain(feed);

    return HttpResponse.ok(responseData);
  }
}

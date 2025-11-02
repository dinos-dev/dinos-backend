import { Body, Controller, Get, Param, ParseEnumPipe, Post, Query } from '@nestjs/common';
import { BookmarkService } from '../application/bookmark.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { HttpResponse } from 'src/common/http/http-response';
import { ToggleBookmarkDto } from './dto/request/toggle.bookmark.dto';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { RequestBookmarkCommand } from '../application/command/request-bookmark.command';
import { ResponseToggleBookmarkDto } from './dto/response/response.toggle.bookmark.dto';
import { FindFilterBookmarkDocs, ToggleBookmarkDocs } from './swagger/rest-swagger.decorator';
import { ItemType } from '../domain/const/item-type.enum';
import { PaginatedBookmarkResponseDto } from './dto/response/response.bookmark.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

@ApiTags('Bookmarks - 북마크')
@ApiBearerAuth()
@ApiCommonErrorResponseTemplate()
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @ToggleBookmarkDocs()
  @Post('toggle')
  async toggleBookmark(
    @Body() dto: ToggleBookmarkDto,
    @UserId() userId: number,
  ): Promise<HttpResponse<ResponseToggleBookmarkDto>> {
    const command = new RequestBookmarkCommand(
      userId,
      dto.feedRefId,
      dto.itemName,
      dto.itemSub,
      dto.itemType,
      dto.restaurantRefId ? dto.restaurantRefId : null,
      dto.itemImageUrl ? dto.itemImageUrl : null,
    );
    const { bookmark, action } = await this.bookmarkService.toggleBookmark(command);
    const result = ResponseToggleBookmarkDto.fromResult({ bookmark, action });
    return HttpResponse.ok(result);
  }

  @FindFilterBookmarkDocs()
  @Get('mine/:itemType')
  async findFilterBookmark(
    @Query() query: PaginationQueryDto,
    @Param('itemType', new ParseEnumPipe(ItemType)) itemType: ItemType,
    @UserId() userId: number,
  ): Promise<HttpResponse<PaginatedBookmarkResponseDto>> {
    const paginationOptions =
      query.page || query.limit
        ? {
            page: query.page || 1,
            limit: query.limit || 20,
          }
        : undefined;
    const result = await this.bookmarkService.findFilterBookmark(userId, itemType, paginationOptions);
    return HttpResponse.ok(PaginatedBookmarkResponseDto.fromBookmarkResult(result));
  }
}

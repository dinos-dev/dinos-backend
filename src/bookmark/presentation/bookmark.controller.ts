import { Body, Controller, Post } from '@nestjs/common';
import { BookmarkService } from '../application/bookmark.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { HttpResponse } from 'src/common/http/http-response';
import { ToggleBookmarkDto } from './dto/request/toggle.bookmark.dto';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { RequestBookmarkCommand } from '../application/command/request-bookmark.command';
import { ResponseToggleBookmarkDto } from './dto/response/response.toggle.bookmark.dto';
import { ToggleBookmarkDocs } from './swagger/rest-swagger.decorator';

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
      dto.restaurantRefId,
      dto.itemName,
      dto.itemImageUrl,
      dto.itemSub,
      dto.itemType,
    );
    const { bookmark, action } = await this.bookmarkService.toggleBookmark(command);
    const result = ResponseToggleBookmarkDto.fromResult({ bookmark, action });
    return HttpResponse.ok(result);
  }
}

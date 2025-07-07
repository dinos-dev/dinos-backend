// import { Test, TestingModule } from '@nestjs/testing';
// import { TokenRepository } from 'src/domain/auth/repository/token.repository';
// import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
// import { mockPrismaService, MockPrismaService } from '../../__mocks__/prisma.service.mock';
// import { createMockUser } from '../../user/user.factory';
// import { createMockToken } from '../token.factory';
// import { PlatFormEnumType } from 'src/domain/auth/constant/platform.const';

// describe('TokenRepository', () => {
//   let repository: TokenRepository;
//   let prismaService: MockPrismaService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         TokenRepository,
//         {
//           provide: PrismaService,
//           useValue: mockPrismaService(),
//         },
//       ],
//     }).compile();

//     repository = module.get<TokenRepository>(TokenRepository);
//     prismaService = module.get<MockPrismaService>(PrismaService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('updateOrCreateRefToken', () => {
//     it('토큰이 존재할 경우 RefreshToken을 업데이트한다.', async () => {
//       // 1. given
//       const user = createMockUser();
//       const token = createMockToken();
//       const refToken = 'refToken';
//       const expiresAt = new Date();
//       const platForm = PlatFormEnumType.WEB;

//       prismaService.token.findFirst.mockResolvedValue(token);
//       prismaService.token.update.mockResolvedValue(token);

//       // 2. when
//       const result = await repository.updateOrCreateRefToken(user, refToken, platForm, expiresAt);

//       // 3. then
//       expect(result).toEqual(token);
//       expect(prismaService.token.update).toHaveBeenCalledWith({
//         where: { id: token.id },
//         data: { refToken },
//       });
//     });
//     it('토큰이 존재하지 않을 경우 RefreshToken을 저장한다.', async () => {
//       // 1. given
//       const user = createMockUser();
//       const token = createMockToken();
//       const refToken = 'refToken';
//       const expiresAt = new Date();
//       const platForm = PlatFormEnumType.WEB;

//       prismaService.token.findFirst.mockResolvedValue(null);
//       prismaService.token.create.mockResolvedValue(token);

//       // 2. when
//       const result = await repository.updateOrCreateRefToken(user, refToken, platForm, expiresAt);

//       // 3. then
//       expect(result).toEqual(token);
//       expect(prismaService.token.create).toHaveBeenCalledWith({
//         data: { userId: user.id, refToken, platForm, expiresAt },
//       });
//     });
//   });
// });

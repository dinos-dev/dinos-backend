import { ProfileEntity } from 'src/user/domain/entities/profile.entity';

describe('ProfileEntity', () => {
  it('올바른 파라미터로 ProfileEntity를 생성한다.', () => {
    // 1.given
    const params = {
      userId: 1,
      nickname: 'testNickname',
      comment: 'testComment',
      headerId: 1,
      bodyId: 1,
      headerColor: '#123456',
      bodyColor: '#654321',
    };

    // 2. when
    const profile = ProfileEntity.create(params);

    // 3. then
    expect(profile.userId).toBe(params.userId);
    expect(profile.nickname).toBe(params.nickname);
    expect(profile.comment).toBe(params.comment);
    expect(profile.headerId).toBe(params.headerId);
    expect(profile.bodyId).toBe(params.bodyId);
    expect(profile.headerColor).toBe(params.headerColor);
    expect(profile.bodyColor).toBe(params.bodyColor);
  });
});

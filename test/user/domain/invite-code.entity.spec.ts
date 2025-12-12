import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';

describe('InviteCodeEntity', () => {
  it('올바른 파라미터로 InviteCodeEntity를 생성한다', () => {
    // 1. given
    const params = {
      userId: 1,
      code: 'D23XV045',
    };
    // 2. when
    const inviteCode = InviteCodeEntity.create(params);
    // 3. then
    expect(inviteCode.userId).toBe(params.userId);
    expect(inviteCode.code).toBe(params.code);
  });
});

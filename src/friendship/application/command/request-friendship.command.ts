export class RequestFriendshipCommand {
  constructor(
    public readonly senderId: number,
    public readonly receiverId: number,
  ) {}
}


export class UserProfileService {
  constructor(
    private userService: any,
    private relationService: any
  ) {}

  // Obtener perfil completo
  async getProfile(userId: number) {
    const user = await this.userService.getUserById(userId);

    const friends = await this.userService.getFriends(userId);

    const receivedRequests = await this.relationService.getReceivedRequests(userId);

    const sentRequests = await this.relationService.getSentRequests(userId);

    return {
      user,
      friends,
      receivedRequests,
      sentRequests
    };
  }
}